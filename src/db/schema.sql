-- Hackverse DB Schema
-- Run once: psql -d hackverse_db -f src/db/schema.sql

CREATE TYPE user_role AS ENUM ('individual', 'organization');
CREATE TYPE moderator_level AS ENUM ('junior', 'senior', 'admin');
CREATE TYPE evidence_type AS ENUM ('video', 'audio', 'text', 'image');
CREATE TYPE stance_type AS ENUM ('support', 'contest', 'invariant');
CREATE TYPE verdict_status AS ENUM ('True', 'False', 'ProbablyTrue', 'Contested', 'Unverifiable');

-- Users
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(255)  NOT NULL,
  email        VARCHAR(255)  NOT NULL UNIQUE,
  phone        VARCHAR(50)   NOT NULL,
  role         user_role     NOT NULL DEFAULT 'individual',
  priority     SMALLINT      NOT NULL DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  password_hash TEXT         NOT NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Moderators
CREATE TABLE IF NOT EXISTS moderators (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255)    NOT NULL,
  email         VARCHAR(255)    NOT NULL UNIQUE,
  password_hash TEXT            NOT NULL,
  level         moderator_level NOT NULL DEFAULT 'junior'
);

-- Themes
CREATE TABLE IF NOT EXISTS themes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  description TEXT
);

-- Rumors
CREATE TABLE IF NOT EXISTS rumors (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text       TEXT         NOT NULL,
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme_id   UUID         NOT NULL REFERENCES themes(id) ON DELETE RESTRICT,
  location   VARCHAR(255),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Claims
CREATE TABLE IF NOT EXISTS claims (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text     TEXT NOT NULL,
  rumor_id UUID NOT NULL REFERENCES rumors(id) ON DELETE CASCADE
);

-- Evidence
CREATE TABLE IF NOT EXISTS evidence (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          evidence_type NOT NULL,
  file_url      TEXT          NOT NULL,
  t_event       TIMESTAMPTZ   NOT NULL,
  t_observation TIMESTAMPTZ   NOT NULL,
  t_upload      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  hash_file     VARCHAR(100)  NOT NULL,
  metadata      JSONB         NOT NULL DEFAULT '{}',
  rumor_id      UUID          NOT NULL REFERENCES rumors(id) ON DELETE CASCADE,
  uploaded_by   UUID          NOT NULL REFERENCES users(id)
);

-- Rules
CREATE TABLE IF NOT EXISTS rules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_type evidence_type NOT NULL,
  condition     TEXT          NOT NULL,
  weight        NUMERIC(4,2)  NOT NULL
);

-- ClaimEvidence (junction)
CREATE TABLE IF NOT EXISTS claim_evidence (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id       UUID          NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  evidence_id    UUID          NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
  rule_id        UUID          NOT NULL REFERENCES rules(id),
  stance         stance_type   NOT NULL,
  score_modifier NUMERIC(5,2)  NOT NULL DEFAULT 0
);

-- Verdicts
CREATE TABLE IF NOT EXISTS verdicts (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id         UUID           NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  status           verdict_status NOT NULL,
  confidence_score NUMERIC(4,3)   NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
  evidences_for    UUID[]         NOT NULL DEFAULT '{}',
  evidences_against UUID[]        NOT NULL DEFAULT '{}',
  moderator_id     UUID           NOT NULL REFERENCES moderators(id),
  is_published     BOOLEAN        NOT NULL DEFAULT FALSE,
  published_at     TIMESTAMPTZ,
  summary          TEXT           NOT NULL
);
