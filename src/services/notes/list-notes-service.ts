import database from "../../database/connection";

interface ListNotesInput {
  userId: number;
  title?: string;
  tags: string[];
}

interface NoteRecord {
  id: number;
  title: string;
  description: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface TagRecord {
  id: number;
  name: string;
  note_id: number;
  user_id: number;
}

export async function listNotesService({ userId, title, tags }: ListNotesInput) {
  const notesQuery = database("notes")
    .select(
      "notes.id",
      "notes.title",
      "notes.description",
      "notes.user_id",
      "notes.created_at",
      "notes.updated_at",
    )
    .where("notes.user_id", userId)
    .modify((query) => {
      if (title) {
        query.whereILike("notes.title", `%${title}%`);
      }

      if (tags.length) {
        query
          .innerJoin("tags", "tags.note_id", "notes.id")
          .whereIn("tags.name", tags)
          .groupBy(
            "notes.id",
            "notes.title",
            "notes.description",
            "notes.user_id",
            "notes.created_at",
            "notes.updated_at",
          )
          .havingRaw("COUNT(DISTINCT tags.name) = ?", [tags.length]);
      }
    })
    .orderBy("notes.title");

  const notes = (await notesQuery) as NoteRecord[];

  if (!notes.length) {
    return [];
  }

  const noteIds = notes.map((note: NoteRecord) => note.id);
  const noteTags = (await database("tags")
    .select("id", "name", "note_id", "user_id")
    .whereIn("note_id", noteIds)
    .orderBy("name")) as TagRecord[];

  return notes.map((note: NoteRecord) => ({
    ...note,
    tags: noteTags.filter((tag: TagRecord) => tag.note_id === note.id),
  }));
}
