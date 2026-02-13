import type { Note, CreateNoteDTO, UpdateNoteDTO } from "../types/notes.ts";
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

export async function updateNote(id: number, dto: UpdateNoteDTO): Promise<Note | null> {
  const client = getClient();

  // Build dynamic update query based on provided fields
  const updates: string[] = [];
  const values: Record<string, unknown> = { id };

  if (dto.title !== undefined) {
    updates.push(`title = ${dto.title}`);
  }
  if (dto.content !== undefined) {
    updates.push(`content = ${dto.content}`);
  }

  if (updates.length === 0) {
    return getNoteById(id);
  }

  updates.push("updated_at = NOW()");

  const result = await client<Note[]>`
    UPDATE notes
    SET ${client(updates.join(", "))}
    WHERE id = ${id}
    RETURNING id, title, content, created_at, updated_at
  `;

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
