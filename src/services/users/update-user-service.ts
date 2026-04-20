import { compare, hash } from "bcryptjs";
import database from "../../database/connection";
import { AppError } from "../../errors/app-error";

interface UpdateUserInput {
  userId: number;
  name?: string;
  email?: string;
  password?: string;
  oldPassword?: string;
}

export async function updateUserService({
  userId,
  name,
  email,
  password,
  oldPassword,
}: UpdateUserInput) {
  const user = await database("users").where({ id: userId }).first();

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  if (email && email !== user.email) {
    const userWithUpdatedEmail = await database("users").where({ email }).first();

    if (userWithUpdatedEmail) {
      throw new AppError("Email already in use.", 409);
    }
  }

  let nextPassword = user.password;

  if (password) {
    if (!oldPassword) {
      throw new AppError("Old password is required.", 400);
    }

    const doesOldPasswordMatch = await compare(oldPassword, user.password);

    if (!doesOldPasswordMatch) {
      throw new AppError("Old password does not match.", 400);
    }

    nextPassword = await hash(password, 8);
  }

  await database("users")
    .where({ id: userId })
    .update({
      name: name ?? user.name,
      email: email ?? user.email,
      password: nextPassword,
      updated_at: database.fn.now(),
    });

  return database("users")
    .where({ id: userId })
    .select("id", "name", "email", "created_at", "updated_at")
    .first();
}
