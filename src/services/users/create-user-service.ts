import { hash } from "bcryptjs";
import database from "../../database/connection";
import { AppError } from "../../errors/app-error";

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export async function createUserService({ name, email, password }: CreateUserInput) {
  const userAlreadyExists = await database("users").where({ email }).first();

  if (userAlreadyExists) {
    throw new AppError("User already exists.", 409);
  }

  const [createdUserId] = await database("users").insert({
    name,
    email,
    password: await hash(password, 8),
  });

  return database("users")
    .where({ id: Number(createdUserId) })
    .select("id", "name", "email", "created_at", "updated_at")
    .first();
}
