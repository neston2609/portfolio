-- Multi-tenant portfolio platform schema.
-- Each child gets one portfolio row (1:1) plus media and a visibility map.
-- Themes are filesystem bundles registered here so they can be assigned per child.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admins (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name          text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS themes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- slug == folder name on disk under themes/. Stable identifier used by children.theme_slug.
  slug          text UNIQUE NOT NULL,
  name          text NOT NULL,
  description   text,
  -- 'builtin' themes ship with the repo, 'uploaded' themes live under themes/_uploaded/.
  source        text NOT NULL DEFAULT 'builtin' CHECK (source IN ('builtin','uploaded')),
  entry_file    text NOT NULL DEFAULT 'index.html',
  manifest      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS children (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Subdomain key. http://{firstname_slug}.rasikawan.com loads this child.
  -- Lowercase ASCII so it works as a DNS label; admin form enforces format.
  firstname_slug text UNIQUE NOT NULL CHECK (firstname_slug ~ '^[a-z0-9]([a-z0-9-]{0,30}[a-z0-9])?$'),
  firstname     text NOT NULL,
  lastname      text,
  nickname      text,
  theme_slug    text NOT NULL REFERENCES themes(slug) ON UPDATE CASCADE ON DELETE RESTRICT,
  is_published  boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_children_published ON children(is_published);

-- Avatar (added in a later migration; idempotent so older deployments upgrade cleanly).
-- ON DELETE SET NULL so removing the media row doesn't break the child.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='children' AND column_name='avatar_media_id'
  ) THEN
    ALTER TABLE children ADD COLUMN avatar_media_id uuid;
    ALTER TABLE children ADD CONSTRAINT children_avatar_fk
      FOREIGN KEY (avatar_media_id) REFERENCES media(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Portfolio is the structured content blob mirroring data.js shape from the design.
-- JSONB lets new themes consume extra fields without schema migrations.
-- Multilang fields are stored as {"en":"...","th":"..."} — only `en` populated for v1.
CREATE TABLE IF NOT EXISTS portfolios (
  child_id      uuid PRIMARY KEY REFERENCES children(id) ON DELETE CASCADE,
  data          jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id      uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  filename      text NOT NULL,
  mime_type     text NOT NULL,
  size_bytes    bigint NOT NULL,
  storage_path  text NOT NULL,
  alt           text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_media_child ON media(child_id);

-- Per-section visibility. section_key is a dotted path like "social.email" or "youtube".
-- Default behavior is visible; rows here mark sections as hidden.
CREATE TABLE IF NOT EXISTS visibility_settings (
  child_id      uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  section_key   text NOT NULL,
  visible       boolean NOT NULL DEFAULT true,
  PRIMARY KEY (child_id, section_key)
);

-- Express session store (connect-pg-simple).
CREATE TABLE IF NOT EXISTS "session" (
  "sid"    varchar NOT NULL COLLATE "default" PRIMARY KEY,
  "sess"   json    NOT NULL,
  "expire" timestamp(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- Bumps updated_at on row update.
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'admins_touch') THEN
    CREATE TRIGGER admins_touch BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'themes_touch') THEN
    CREATE TRIGGER themes_touch BEFORE UPDATE ON themes FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'children_touch') THEN
    CREATE TRIGGER children_touch BEFORE UPDATE ON children FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'portfolios_touch') THEN
    CREATE TRIGGER portfolios_touch BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
  END IF;
END $$;
