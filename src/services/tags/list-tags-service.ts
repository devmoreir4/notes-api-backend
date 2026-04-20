import database from "../../database/connection";

export async function listTagsService(userId: number) {
  return database("tags")
    .select("id", "name", "note_id", "user_id", "created_at", "updated_at")
    .where({ user_id: userId })
    .orderBy("name");
}
