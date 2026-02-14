CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname      VARCHAR(100),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Cycles
CREATE TABLE cycles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date    DATE NOT NULL,
  cycle_number  INTEGER NOT NULL,
  subtitle      VARCHAR(255),
  title         VARCHAR(255),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_cycles_user_id ON cycles(user_id);

-- Injections (1:N)
CREATE TABLE injections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id        UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  medication_name VARCHAR(255) NOT NULL,
  dosage          VARCHAR(100) NOT NULL,
  date            DATE NOT NULL,
  time            TIME,
  memo            TEXT
);
CREATE INDEX idx_injections_cycle_id ON injections(cycle_id);

-- Retrievals (1:1)
CREATE TABLE retrievals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id        UUID UNIQUE NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  retrieval_date  DATE NOT NULL,
  total_eggs      INTEGER NOT NULL,
  memo            TEXT
);

-- Fertilizations (1:1)
CREATE TABLE fertilizations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id            UUID UNIQUE NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  fertilization_date  DATE NOT NULL,
  total_fertilized    INTEGER NOT NULL,
  memo                TEXT
);

-- Cultures (1:1)
CREATE TABLE cultures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id        UUID UNIQUE NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  day             INTEGER NOT NULL CHECK (day >= 1),
  total_embryos   INTEGER NOT NULL,
  next_plans      TEXT[] DEFAULT '{}',
  grade_a         INTEGER,
  grade_b         INTEGER,
  grade_c         INTEGER,
  memo            TEXT
);

-- Transfers (1:1)
CREATE TABLE transfers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id        UUID UNIQUE NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  transfer_date   DATE NOT NULL,
  transfer_count  INTEGER NOT NULL,
  memo            TEXT
);

-- Freezes (1:1)
CREATE TABLE freezes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id        UUID UNIQUE NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  freeze_date     DATE NOT NULL,
  frozen_count    INTEGER NOT NULL,
  memo            TEXT
);

-- PGTs (1:1)
CREATE TABLE pgts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id        UUID UNIQUE NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  tested          INTEGER NOT NULL,
  euploid         INTEGER NOT NULL,
  mosaic          INTEGER,
  abnormal        INTEGER NOT NULL,
  result_date     DATE NOT NULL
);
