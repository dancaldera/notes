export const schemaSql = `
-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for efficient sorting
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
`;
