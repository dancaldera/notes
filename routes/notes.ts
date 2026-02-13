import { Router } from "../deps.ts";
import type { CreateNoteDTO, UpdateNoteDTO } from "../types/notes.ts";
import * as noteQueries from "../db/queries.ts";

const router = new Router();

// GET /api/notes - List all notes
router.get("/api/notes", async (ctx) => {
  try {
    const notes = await noteQueries.getAllNotes();
    ctx.response.body = notes;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Failed to fetch notes",
      details: error instanceof Error ? error.message : String(error),
    };
  }
});

// GET /api/notes/:id - Get single note
router.get("/api/notes/:id", async (ctx) => {
  try {
    const id = parseInt(ctx.params.id, 10);

    if (isNaN(id)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid note ID" };
      return;
    }

    const note = await noteQueries.getNoteById(id);

    if (!note) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Note not found" };
      return;
    }

    ctx.response.body = note;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Failed to fetch note",
      details: error instanceof Error ? error.message : String(error),
    };
  }
});

// POST /api/notes - Create note
router.post("/api/notes", async (ctx) => {
  try {
    const body = await ctx.request.body.json();

    // Validate required fields
    if (!body || typeof body !== "object") {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid request body" };
      return;
    }

    if (!body.title || typeof body.title !== "string") {
      ctx.response.status = 400;
      ctx.response.body = { error: "Title is required and must be a string" };
      return;
    }

    const dto: CreateNoteDTO = {
      title: body.title,
      content: body.content,
    };

    const note = await noteQueries.createNote(dto);
    ctx.response.status = 201;
    ctx.response.body = note;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Failed to create note",
      details: error instanceof Error ? error.message : String(error),
    };
  }
});

// PATCH /api/notes/:id - Update note
router.patch("/api/notes/:id", async (ctx) => {
  try {
    const id = parseInt(ctx.params.id, 10);

    if (isNaN(id)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid note ID" };
      return;
    }

    const body = await ctx.request.body.json();

    if (!body || typeof body !== "object") {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid request body" };
      return;
    }

    const dto: UpdateNoteDTO = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string") {
        ctx.response.status = 400;
        ctx.response.body = { error: "Title must be a string" };
        return;
      }
      dto.title = body.title;
    }

    if (body.content !== undefined) {
      if (typeof body.content !== "string") {
        ctx.response.status = 400;
        ctx.response.body = { error: "Content must be a string" };
        return;
      }
      dto.content = body.content;
    }

    if (Object.keys(dto).length === 0) {
      ctx.response.status = 400;
      ctx.response.body = { error: "No fields to update" };
      return;
    }

    const note = await noteQueries.updateNote(id, dto);

    if (!note) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Note not found" };
      return;
    }

    ctx.response.body = note;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Failed to update note",
      details: error instanceof Error ? error.message : String(error),
    };
  }
});

// DELETE /api/notes/:id - Delete note
router.delete("/api/notes/:id", async (ctx) => {
  try {
    const id = parseInt(ctx.params.id, 10);

    if (isNaN(id)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid note ID" };
      return;
    }

    const success = await noteQueries.deleteNote(id);

    if (!success) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Note not found" };
      return;
    }

    ctx.response.body = { success: true };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Failed to delete note",
      details: error instanceof Error ? error.message : String(error),
    };
  }
});

export default router;
