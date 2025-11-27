--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: tiger; Type: SCHEMA; Schema: -; Owner: fulbo_admin
--

CREATE SCHEMA tiger;


ALTER SCHEMA tiger OWNER TO fulbo_admin;

--
-- Name: tiger_data; Type: SCHEMA; Schema: -; Owner: fulbo_admin
--

CREATE SCHEMA tiger_data;


ALTER SCHEMA tiger_data OWNER TO fulbo_admin;

--
-- Name: topology; Type: SCHEMA; Schema: -; Owner: fulbo_admin
--

CREATE SCHEMA topology;


ALTER SCHEMA topology OWNER TO fulbo_admin;

--
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: fulbo_admin
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: auth_provider_type; Type: TYPE; Schema: public; Owner: fulbo_admin
--

CREATE TYPE public.auth_provider_type AS ENUM (
    'email',
    'google',
    'facebook',
    'apple'
);


ALTER TYPE public.auth_provider_type OWNER TO fulbo_admin;

--
-- Name: booking_status; Type: TYPE; Schema: public; Owner: fulbo_admin
--

CREATE TYPE public.booking_status AS ENUM (
    'pending',
    'confirmed',
    'cancelled'
);


ALTER TYPE public.booking_status OWNER TO fulbo_admin;

--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: fulbo_admin
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'succeeded',
    'failed'
);


ALTER TYPE public.payment_status OWNER TO fulbo_admin;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: fulbo_admin
--

CREATE TYPE public.user_role AS ENUM (
    'player',
    'manager'
);


ALTER TYPE public.user_role OWNER TO fulbo_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: fulbo_admin
--

CREATE TABLE public.bookings (
    booking_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    player_id uuid NOT NULL,
    field_id uuid NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    total_price numeric(10,2) NOT NULL,
    status public.booking_status DEFAULT 'pending'::public.booking_status NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bookings_check CHECK ((end_time > start_time))
);


ALTER TABLE public.bookings OWNER TO fulbo_admin;

--
-- Name: field_photos; Type: TABLE; Schema: public; Owner: fulbo_admin
--

CREATE TABLE public.field_photos (
    photo_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    field_id uuid NOT NULL,
    image_url character varying(1024) NOT NULL,
    is_cover boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.field_photos OWNER TO fulbo_admin;

--
-- Name: fields; Type: TABLE; Schema: public; Owner: fulbo_admin
--

CREATE TABLE public.fields (
    field_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    owner_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    address text NOT NULL,
    description text,
    location public.geography(Point,4326),
    amenities jsonb DEFAULT '{}'::jsonb,
    base_price_per_hour numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.fields OWNER TO fulbo_admin;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: fulbo_admin
--

CREATE TABLE public.payments (
    payment_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    booking_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
    payment_gateway_id character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payments OWNER TO fulbo_admin;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: fulbo_admin
--

CREATE TABLE public.reviews (
    review_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    field_id uuid NOT NULL,
    player_id uuid,
    rating smallint NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO fulbo_admin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: fulbo_admin
--

CREATE TABLE public.users (
    user_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255),
    phone_number character varying(50),
    role public.user_role DEFAULT 'player'::public.user_role NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    auth_provider public.auth_provider_type DEFAULT 'email'::public.auth_provider_type NOT NULL,
    auth_provider_id character varying(255),
    city character varying(100),
    district character varying(100),
    document_number character varying(20),
    document_type character varying(20),
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL
);


ALTER TABLE public.users OWNER TO fulbo_admin;

--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: fulbo_admin
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (booking_id);


--
-- Name: field_photos field_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: fulbo_admin
--

ALTER TABLE ONLY public.field_photos
    ADD CONSTRAINT field_photos_pkey PRIMARY KEY (photo_id);


--
-- Name: fields fields_pkey; Type: CONSTRAINT; Schema: public; Owner: fulbo_admin
--

ALTER TABLE ONLY public.fields
    ADD CONSTRAINT fields_pkey PRIMARY KEY (field_id);


--
-- Name: bookings no_double_booking; Type: CONSTRAINT; Schema: public; Owner: fulbo_admin
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT no_double_booking EXCLUDE USING gist (field_id WITH =, tstzrange(start_time, end_time) WITH &&) WHERE ((status <> 'cancelled'::public.booking_status));


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: fulbo_admin
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (payment_id);


--
-- Name: reviews reviews_field_id_player_id_key; Type: CONSTRAINT; Schema: public; Owner: fulbo_admin
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_field_id_player_id_key UNIQUE (field_id, player_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: fulbo_admin
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: fulbo_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: fulbo_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: idx_bookings_field_id; Type: INDEX; Schema: public; Owner: fulbo_admin
--

CREATE INDEX idx_bookings_field_id ON public.bookings USING btree (field_id);


--
-- Name: idx_bookings_player_id; Type: INDEX; Schema: public; Owner: fulbo_admin
--

CREATE INDEX idx_bookings_player_id ON public.bookings USING btree (player_id);


--
-- Name: idx_fields_location; Type: INDEX; Schema: public; Owner: fulbo_admin
--

CREATE INDEX idx_fields_location ON public.fields USING gist (location);


--
-- Name: idx_fields_owner_id; Type: INDEX; Schema: public; Owner: fulbo_admin
--

CREATE INDEX idx_fields_owner_id ON public.fields USING btree (owner_id);


--
-- Name: idx_payments_booking_id; Type: INDEX; Schema: public; Owner: fulbo_admin
--

CREATE INDEX idx_payments_booking_id ON public.payments USING btree (booking_id);


--
-- Name: idx_reviews_field_id; Type: INDEX; Schema: public; Owner: fulbo_admin
--

CREATE INDEX idx_reviews_field_id ON public.reviews USING btree (field_id);


--
-- Name: bookings bookings_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fulbo_admin
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.fields(field_id) ON DELETE CASCADE;


--
-- Name: bookings bookings_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fulbo_admin
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: field_photos field_photos_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fulbo_admin
--

ALTER TABLE ONLY public.field_photos
    ADD CONSTRAINT field_photos_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.fields(field_id) ON DELETE CASCADE;


--
-- Name: fields fields_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fulbo_admin
--

ALTER TABLE ONLY public.fields
    ADD CONSTRAINT fields_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(user_id) ON DELETE RESTRICT;


--
-- Name: payments payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fulbo_admin
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id) ON DELETE CASCADE;


--
-- Name: reviews reviews_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fulbo_admin
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.fields(field_id) ON DELETE CASCADE;


--
-- Name: reviews reviews_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fulbo_admin
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

