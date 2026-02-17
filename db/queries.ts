import type { CreateNoteDTO, Note, UpdateNoteDTO } from "../types/notes.ts";
import { getClient } from "./client.ts";

export async function getAllNotes(): Promise<Note[]> {
  const client = getClient();
  return await client<Note[]>`
    SELECT id, title, content, created_at, updated_at
    FROM notes
    ORDER BY created_at DESC
  `;
}

export async function getNoteById(id: number): Promise<Note | null> {
  const client = getClient();
  const result = await client<Note[]>`
    SELECT id, title, content, created_at, updated_at
    FROM notes
    WHERE id = ${id}
  `;
  return result[0] || null;
}

export async function createNote(dto: CreateNoteDTO): Promise<Note> {
  const client = getClient();
  const result = await client<Note[]>`
    INSERT INTO notes (title, content)
    VALUES (${dto.title}, ${dto.content || null})
    RETURNING id, title, content, created_at, updated_at
  `;
  return result[0];
}

export async function updateNote(
  id: number,
  dto: UpdateNoteDTO,
): Promise<Note | null> {
  const client = getClient();

  if (dto.title === undefined && dto.content === undefined) {
    return getNoteById(id);
  }

  const params: (string | number | null)[] = [];
  let setClause = "";

  if (dto.title !== undefined) {
    setClause = `title = $${params.length + 1}`;
    params.push(dto.title);
  }
  if (dto.content !== undefined) {
    if (setClause) setClause += ", ";
    setClause += `content = $${params.length + 1}`;
    params.push(dto.content);
  }

  if (setClause) setClause += ", ";
  setClause += `updated_at = NOW()`;
  params.push(id);

  const sql =
    `UPDATE notes SET ${setClause} WHERE id = $${params.length} RETURNING id, title, content, created_at, updated_at`;

  const result = await client.unsafe<Note[]>(sql, params);

  return result[0] || null;
}

export async function deleteNote(id: number): Promise<boolean> {
  const client = getClient();
  const result = await client`
    DELETE FROM notes
    WHERE id = ${id}
    RETURNING id
  `;
  return result.count > 0;
}
