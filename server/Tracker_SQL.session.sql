CREATE TABLE pending_verifications (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 minutes')
);
-- USERS TABLE
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    -- Must have a name, can't be just empty spaces
    name VARCHAR(100) NOT NULL CHECK (char_length(trim(name)) > 0),
    -- Must be a valid, unique email
    email VARCHAR(100) NOT NULL UNIQUE CHECK (position('@' IN email) > 1),
    -- Must have a password hash (not empty)
    password_hash TEXT NOT NULL CHECK (char_length(trim(password_hash)) > 0),
    -- Role must be limited to allowed values
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    token TEXT UNIQUE NOT NULL,
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- BOUNDARY TABLE
CREATE TABLE boundary (
    boundary_id SERIAL PRIMARY KEY,
    -- Link to a valid user (nullable)
    user_id INTEGER REFERENCES users(user_id) ON DELETE
    SET NULL,
        -- Boundary name (required)
        name VARCHAR(100) NOT NULL CHECK (char_length(name) > 0),
        -- Spatial boundary polygon (PostGIS)
        geom GEOGRAPHY(POLYGON, 4326) NOT NULL,
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ANIMAL TABLE
CREATE TABLE animal (
    animal_id SERIAL PRIMARY KEY,
    -- Link to the owning user, can be NULL if user is deleted
    user_id INTEGER REFERENCES users(user_id) ON DELETE
    SET NULL,
        -- Tag must be unique and non-empty
        tag_id VARCHAR(50) NOT NULL UNIQUE CHECK (char_length(trim(tag_id)) > 0),
        -- Animal type (e.g., 'cow', 'goat'), must be present and not just whitespace
        type VARCHAR(50) NOT NULL CHECK (char_length(trim(type)) > 0),
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE location (
    location_id SERIAL PRIMARY KEY,
    -- Link to an animal
    animal_id INTEGER NOT NULL REFERENCES animal(animal_id) ON DELETE CASCADE,
    -- Spatial point (PostGIS geography)
    geom GEOGRAPHY(POINT, 4326) NOT NULL,
    -- Timestamp when location was recorded
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- For future updates
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ACTIVITY TABLE
CREATE TABLE activity (
    activity_id SERIAL PRIMARY KEY,
    -- Required reference to the animal
    animal_id INTEGER NOT NULL REFERENCES animal(animal_id) ON DELETE CASCADE,
    -- Status must be defined and valid
    status VARCHAR(50) NOT NULL CHECK (status IN ('inside', 'outside', 'idle')),
    -- Optional fields related to idle behavior
    idle_start TIMESTAMP,
    -- nullable if not idle
    idle_time INTERVAL CHECK (
        idle_time IS NULL
        OR idle_time > INTERVAL '0'
    ),
    -- Timestamps
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ALERT TABLE
CREATE TABLE alert (
    alert_id SERIAL PRIMARY KEY,
    -- Must refer to a valid animal
    animal_id INTEGER NOT NULL REFERENCES animal(animal_id) ON DELETE CASCADE,
    -- Only one of these will be set (mutually exclusive)
    boundary_id INTEGER REFERENCES boundary(boundary_id) ON DELETE
    SET NULL,
        activity_id INTEGER REFERENCES activity(activity_id) ON DELETE CASCADE,
        -- Type must be non-empty (e.g., 'exit', 'entry', 'idle')
        alert_type VARCHAR(50) NOT NULL CHECK (char_length(trim(alert_type)) > 0),
        -- Optional human-readable message
        message TEXT,
        -- Auto-generated timestamps
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        -- Enforce only one cause per alert
        CHECK (
            (
                activity_id IS NOT NULL
                AND boundary_id IS NULL
            )
            OR (
                activity_id IS NULL
                AND boundary_id IS NOT NULL
            )
        )
);
-- Distace//Trace path TABLE