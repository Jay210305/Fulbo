-- 1. EXTENSIONES
-- Necesitamos 'uuid-ossp' para generar UUIDs (IDs únicos universales)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Necesitamos 'postgis' para almacenar y consultar ubicaciones geográficas
CREATE EXTENSION IF NOT EXISTS "postgis";
-- Necesitamos 'btree_gist' para la restricción de exclusión de reservas
CREATE EXTENSION IF NOT EXISTS "btree_gist";


-- 2. TIPOS PERSONALIZADOS (ENUMs)
-- Esto nos permite restringir los valores de ciertas columnas
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('player', 'manager');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- 3. TABLAS PRINCIPALES

-- Tabla de Usuarios y Autenticación
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    role user_role NOT NULL DEFAULT 'player',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Canchas (Fields)
CREATE TABLE IF NOT EXISTS fields (
    field_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- El 'owner' es un usuario con rol 'manager'
    owner_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    description TEXT,

    -- Columna PostGIS para geolocalización (latitud, longitud)
    -- SRID 4326 es el estándar para coordenadas (WGS 84)
    location GEOGRAPHY(POINT, 4326),

    -- JSONB para guardar datos flexibles como {"wifi": true, "showers": true, "parking": false}
    amenities JSONB DEFAULT '{}'::jsonb,

    base_price_per_hour DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para las fotos de cada cancha
CREATE TABLE IF NOT EXISTS field_photos (
    photo_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Si se borra la cancha, se borran sus fotos
    field_id UUID NOT NULL REFERENCES fields(field_id) ON DELETE CASCADE,
    image_url VARCHAR(1024) NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- 4. TABLAS TRANSACCIONALES (El Núcleo)

-- Tabla de Reservas (Bookings)
CREATE TABLE IF NOT EXISTS bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Si el jugador se borra, la reserva se mantiene (pero sin jugador asociado)
    player_id UUID NOT NULL REFERENCES users(user_id) ON DELETE SET NULL,
    -- Si la cancha se borra, se borran sus reservas
    field_id UUID NOT NULL REFERENCES fields(field_id) ON DELETE CASCADE,

    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- VALIDACIÓN: Asegurar que end_time sea después de start_time
    CHECK (end_time > start_time),

    -- RESTRICCIÓN CLAVE: EVITAR DOBLES RESERVAS (OVERLAPPING)
    -- Esto previene que se inserte una reserva si su rango de tiempo (tsrange)
    -- se superpone (&&) con otra reserva para la misma cancha (field_id),
    -- siempre y cuando la reserva existente NO esté 'cancelled'.
    CONSTRAINT no_double_booking
    EXCLUDE USING GIST (
        field_id WITH =,
        -- CORRECCIÓN: Usamos tstzrange porque tus columnas son TIMESTAMPTZ
        tstzrange(start_time, end_time) WITH &&
    )
    WHERE (status != 'cancelled')
);

-- Tabla de Pagos
CREATE TABLE IF NOT EXISTS payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Un pago está atado a una reserva. Si se borra la reserva, se borra el pago.
    booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',

    -- ID de la transacción en la pasarela de pago (ej. Stripe, MercadoPago)
    payment_gateway_id VARCHAR(255),

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- 5. TABLAS ADICIONALES (Social)

-- Tabla de Reseñas (Reviews)
CREATE TABLE IF NOT EXISTS reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Si la cancha se borra, se borran sus reseñas
    field_id UUID NOT NULL REFERENCES fields(field_id) ON DELETE CASCADE,
    -- Si el jugador se borra, su reseña se queda anónima (o se borra, prefiero SET NULL)
    player_id UUID REFERENCES users(user_id) ON DELETE SET NULL,

    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Un jugador solo puede dejar una reseña por cancha
    UNIQUE(field_id, player_id)
);


-- 6. ÍNDICES PARA MEJORAR RENDIMIENTO
-- (Usamos IF NOT EXISTS para evitar errores si lo corres dos veces)

CREATE INDEX IF NOT EXISTS idx_fields_owner_id ON fields(owner_id);
CREATE INDEX IF NOT EXISTS idx_fields_location ON fields USING GIST(location);

CREATE INDEX IF NOT EXISTS idx_bookings_player_id ON bookings(player_id);
CREATE INDEX IF NOT EXISTS idx_bookings_field_id ON bookings(field_id);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);

CREATE INDEX IF NOT EXISTS idx_reviews_field_id ON reviews(field_id);