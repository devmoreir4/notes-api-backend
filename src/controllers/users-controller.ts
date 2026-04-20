import type { Request, Response } from "express";
import { createUserService } from "../services/users/create-user-service";
import { deleteUserService } from "../services/users/delete-user-service";
import { showUserService } from "../services/users/show-user-service";
import { updateUserService } from "../services/users/update-user-service";
import {
  ensureNonEmptyString,
  ensureObjectBody,
  ensureOptionalString,
  ensurePositiveInteger,
} from "../utils/validation";

class UsersController {
  create = async (request: Request, response: Response) => {
    const body = ensureObjectBody(request.body);
    const name = ensureNonEmptyString(body.name, "name");
    const email = ensureNonEmptyString(body.email, "email");
    const password = ensureNonEmptyString(body.password, "password");

    const user = await createUserService({ name, email, password });

    return response.status(201).json(user);
  };

  update = async (request: Request, response: Response) => {
    const body = ensureObjectBody(request.body);
    const userId = ensurePositiveInteger(request.params.id, "id");

    const user = await updateUserService({
      userId,
      name: ensureOptionalString(body.name, "name"),
      email: ensureOptionalString(body.email, "email"),
      password: ensureOptionalString(body.password, "password"),
      oldPassword: ensureOptionalString(body.old_password, "old_password"),
    });

    return response.json(user);
  };

  show = async (request: Request, response: Response) => {
    const userId = ensurePositiveInteger(request.params.id, "id");
    const user = await showUserService(userId);

    return response.json(user);
  };

  delete = async (request: Request, response: Response) => {
    const userId = ensurePositiveInteger(request.params.id, "id");

    await deleteUserService(userId);

    return response.status(204).send();
  };
}

export default new UsersController();
