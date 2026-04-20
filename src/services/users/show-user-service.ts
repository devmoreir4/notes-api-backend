import database from "../../database/connection";
import { AppError } from "../../errors/app-error";

export async function showUserService(userId: number) {
  const user = await database("users")
    .where({ id: userId })
    .select("id", "name", "email", "created_at", "updated_at")
    .first();

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return user;
}
