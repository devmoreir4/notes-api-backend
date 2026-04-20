import database from "../../database/connection";
import { AppError } from "../../errors/app-error";

interface CreateNoteInput {
  userId: number;
  title: string;
  description?: string;
  tags: string[];
  links: string[];
}

export async function createNoteService({
  userId,
  title,
  description,
  tags,
  links,
}: CreateNoteInput) {
  const user = await database("users").where({ id: userId }).first();

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return database.transaction(async (trx) => {
    const [createdNoteId] = await trx("notes").insert({
      title,
      description: description ?? "",
      user_id: userId,
    });

    const createdNote = await trx("notes")
      .where({ id: Number(createdNoteId) })
      .first("id", "title", "description", "user_id", "created_at", "updated_at");

    if (tags.length) {
      await trx("tags").insert(
        tags.map((tag) => ({
          name: tag,
          note_id: createdNote.id,
          user_id: userId,
        })),
      );
    }

    if (links.length) {
      await trx("links").insert(
        links.map((url) => ({
          url,
          note_id: createdNote.id,
        })),
      );
    }

    return createdNote;
  });
}
