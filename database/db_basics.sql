-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. TIPOS PERSONALIZADOS (ENUMs)
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

-- (Opcional) Enum para proveedores de autenticación si quieres ser estricto
DO $$ BEGIN
    CREATE TYPE auth_provider_type AS ENUM ('email', 'google', 'facebook', 'apple');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- 3. TABLAS PRINCIPALES

-- Tabla de Usuarios y Autenticación (ACTUALIZADA SEGÚN FRONTEND)
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Datos de Login (Paso 2 + Social Login)
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- La contraseña puede ser NULL si el usuario se registra con Google/Apple
    password_hash VARCHAR(255), 
    
    -- Campos para manejar el Social Login (Google, Apple, Facebook)
    auth_provider auth_provider_type DEFAULT 'email',
    auth_provider_id VARCHAR(255), -- El ID único que te da Google/FB

    -- Datos Personales (Paso 1 del Frontend)
    first_name VARCHAR(100) NOT NULL, -- 'Nombres'
    last_name VARCHAR(100) NOT NULL,  -- 'Apellidos'
    
    -- Identificación (Paso 1)
    document_type VARCHAR(20),   -- 'Tipo de documento' (DNI, Pasaporte, CE, etc.)
    document_number VARCHAR(20), -- 'Documento de identificación'
    
    -- Ubicación del Usuario (Paso 1)
    city VARCHAR(100),     -- 'Ciudad'
    district VARCHAR(100), -- 'Distrito de residencia'
    
    phone_number VARCHAR(50), -- No está en las fotos, pero es útil mantenerlo
    role user_role NOT NULL DEFAULT 'player',
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Canchas (Fields) - Sin cambios requeridos por el registro
CREATE TABLE IF NOT EXISTS fields (
    field_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    location GEOGRAPHY(POINT, 4326),
    amenities JSONB DEFAULT '{}'::jsonb,
    base_price_per_hour DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para las fotos de cada cancha
CREATE TABLE IF NOT EXISTS field_photos (
    photo_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID NOT NULL REFERENCES fields(field_id) ON DELETE CASCADE,
    image_url VARCHAR(1024) NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- 4. TABLAS TRANSACCIONALES

-- Tabla de Reservas (Bookings)
CREATE TABLE IF NOT EXISTS bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES users(user_id) ON DELETE SET NULL,
    field_id UUID NOT NULL REFERENCES fields(field_id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CHECK (end_time > start_time),

    CONSTRAINT no_double_booking
    EXCLUDE USING GIST (
        field_id WITH =,
        tstzrange(start_time, end_time) WITH &&
    )
    WHERE (status != 'cancelled')
);

-- Tabla de Pagos
CREATE TABLE IF NOT EXISTS payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    payment_gateway_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- 5. TABLAS ADICIONALES

-- Tabla de Reseñas (Reviews)
CREATE TABLE IF NOT EXISTS reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID NOT NULL REFERENCES fields(field_id) ON DELETE CASCADE,
    player_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(field_id, player_id)
);


-- 6. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email); -- Importante para login rápido
CREATE INDEX IF NOT EXISTS idx_fields_owner_id ON fields(owner_id);
CREATE INDEX IF NOT EXISTS idx_fields_location ON fields USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_bookings_player_id ON bookings(player_id);
CREATE INDEX IF NOT EXISTS idx_bookings_field_id ON bookings(field_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_field_id ON reviews(field_id);