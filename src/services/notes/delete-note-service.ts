import database from "../../database/connection";
import { AppError } from "../../errors/app-error";

export async function deleteNoteService(noteId: number): Promise<void> {
  const note = await database("notes").where({ id: noteId }).first();

  if (!note) {
    throw new AppError("Note not found.", 404);
  }

  await database("notes").where({ id: noteId }).delete();
}
