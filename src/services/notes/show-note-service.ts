import database from "../../database/connection";
import { AppError } from "../../errors/app-error";

export async function showNoteService(noteId: number) {
  const note = await database("notes").where({ id: noteId }).first();

  if (!note) {
    throw new AppError("Note not found.", 404);
  }

  const [tags, links] = await Promise.all([
    database("tags")
      .select("id", "name", "note_id", "user_id", "created_at", "updated_at")
      .where({ note_id: noteId })
      .orderBy("name"),
    database("links")
      .select("id", "url", "note_id", "created_at", "updated_at")
      .where({ note_id: noteId })
      .orderBy("created_at"),
  ]);

  return {
    ...note,
    tags,
    links,
  };
}
