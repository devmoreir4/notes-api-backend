import database from "../../database/connection";
import { AppError } from "../../errors/app-error";

export async function deleteUserService(userId: number): Promise<void> {
  const user = await database("users").where({ id: userId }).first();

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  await database("users").where({ id: userId }).delete();
}
