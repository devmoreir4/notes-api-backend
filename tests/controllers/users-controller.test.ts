import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createUserServiceMock,
  updateUserServiceMock,
  showUserServiceMock,
  deleteUserServiceMock,
} = vi.hoisted(() => ({
  createUserServiceMock: vi.fn(),
  updateUserServiceMock: vi.fn(),
  showUserServiceMock: vi.fn(),
  deleteUserServiceMock: vi.fn(),
}));

vi.mock("../../src/services/users/create-user-service", () => ({
  createUserService: createUserServiceMock,
}));

vi.mock("../../src/services/users/update-user-service", () => ({
  updateUserService: updateUserServiceMock,
}));

vi.mock("../../src/services/users/show-user-service", () => ({
  showUserService: showUserServiceMock,
}));

vi.mock("../../src/services/users/delete-user-service", () => ({
  deleteUserService: deleteUserServiceMock,
}));

import usersController from "../../src/controllers/users-controller";

function createResponseMock(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

describe("users controller", () => {
  beforeEach(() => {
    createUserServiceMock.mockReset();
    updateUserServiceMock.mockReset();
    showUserServiceMock.mockReset();
    deleteUserServiceMock.mockReset();
  });

  it("creates a user and returns 201", async () => {
    const response = createResponseMock();
    const user = { id: 1, name: "John", email: "john@example.com" };

    createUserServiceMock.mockResolvedValue(user);

    await usersController.create(
      {
        body: {
          name: "John",
          email: "john@example.com",
          password: "secret123",
        },
      } as Request,
      response,
    );

    expect(createUserServiceMock).toHaveBeenCalledWith({
      name: "John",
      email: "john@example.com",
      password: "secret123",
    });
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(user);
  });

  it("updates a user and returns the payload", async () => {
    const response = createResponseMock();
    const user = { id: 1, name: "John Updated", email: "john.updated@example.com" };

    updateUserServiceMock.mockResolvedValue(user);

    await usersController.update(
      {
        params: { id: "1" },
        body: {
          name: "John Updated",
          email: "john.updated@example.com",
          password: "new-secret",
          old_password: "old-secret",
        },
      } as unknown as Request,
      response,
    );

    expect(updateUserServiceMock).toHaveBeenCalledWith({
      userId: 1,
      name: "John Updated",
      email: "john.updated@example.com",
      password: "new-secret",
      oldPassword: "old-secret",
    });
    expect(response.json).toHaveBeenCalledWith(user);
  });

  it("shows a user by id", async () => {
    const response = createResponseMock();
    const user = { id: 1, name: "John", email: "john@example.com" };

    showUserServiceMock.mockResolvedValue(user);

    await usersController.show(
      {
        params: { id: "1" },
      } as unknown as Request,
      response,
    );

    expect(showUserServiceMock).toHaveBeenCalledWith(1);
    expect(response.json).toHaveBeenCalledWith(user);
  });

  it("deletes a user and returns 204", async () => {
    const response = createResponseMock();

    deleteUserServiceMock.mockResolvedValue(undefined);

    await usersController.delete(
      {
        params: { id: "1" },
      } as unknown as Request,
      response,
    );

    expect(deleteUserServiceMock).toHaveBeenCalledWith(1);
    expect(response.status).toHaveBeenCalledWith(204);
    expect(response.send).toHaveBeenCalledTimes(1);
  });
});
