/*
# Create observations and cleanups tables (single-tenant, no auth)

1. New Tables
- `observations` — stores AI waste identification results saved by the user
  - id (int8, auto-incrementing primary key)
  - item_name (text, not null) — likely name of the identified waste item
  - category (text, not null) — waste category (Plastic, Glass, etc.)
  - explanation (text, not null) — AI explanation of the identification
  - confidence (text, not null) — descriptive confidence label
  - disposal_action (text, not null) — suggested disposal steps
  - safety_warnings (text, default '') — safety precautions
  - needs_professional (boolean, default false) — whether professional handling is needed
  - image_filename (text, nullable) — original filename of the uploaded image
  - created_at (timestamptz, default now()) — when the observation was saved
- `cleanups` — stores user-recorded cleanup activities (items actually collected)
  - id (int8, auto-incrementing primary key)
  - description (text, not null) — what the cleanup involved
  - items_collected (int4, not null) — number of items actually collected
  - created_at (timestamptz, default now()) — when the cleanup was recorded

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD because this is a single-tenant app with no sign-in.
  The data is intentionally shared/public for the local user.

3. Important Notes
- This app has no authentication. The anon-key frontend client reads and writes directly.
- All four CRUD policies (SELECT, INSERT, UPDATE, DELETE) are created for each table.
- `USING (true)` is correct here because the data is intentionally public/shared (no auth).
*/

CREATE TABLE IF NOT EXISTS observations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_name text NOT NULL,
  category text NOT NULL,
  explanation text NOT NULL,
  confidence text NOT NULL,
  disposal_action text NOT NULL,
  safety_warnings text DEFAULT '',
  needs_professional boolean DEFAULT false,
  image_filename text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE observations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_observations" ON observations;
CREATE POLICY "anon_select_observations"
ON observations FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_observations" ON observations;
CREATE POLICY "anon_insert_observations"
ON observations FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_observations" ON observations;
CREATE POLICY "anon_update_observations"
ON observations FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_observations" ON observations;
CREATE POLICY "anon_delete_observations"
ON observations FOR DELETE
TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS cleanups (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  description text NOT NULL,
  items_collected integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cleanups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cleanups" ON cleanups;
CREATE POLICY "anon_select_cleanups"
ON cleanups FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cleanups" ON cleanups;
CREATE POLICY "anon_insert_cleanups"
ON cleanups FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cleanups" ON cleanups;
CREATE POLICY "anon_update_cleanups"
ON cleanups FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cleanups" ON cleanups;
CREATE POLICY "anon_delete_cleanups"
ON cleanups FOR DELETE
TO anon, authenticated USING (true);
