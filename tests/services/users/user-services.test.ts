import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUserService } from "../../../src/services/users/create-user-service";
import { deleteUserService } from "../../../src/services/users/delete-user-service";
import { showUserService } from "../../../src/services/users/show-user-service";
import { updateUserService } from "../../../src/services/users/update-user-service";
import {
  createDeleteBuilder,
  createInsertBuilder,
  createWhereSelectFirstBuilder,
  createUpdateBuilder,
  createWhereFirstBuilder,
  createSelectFirstBuilder,
} from "../../support/query-builders";

const { databaseMock, transactionMock, nowMock, hashMock, compareMock } = vi.hoisted(
  () => ({
    databaseMock: vi.fn(),
    transactionMock: vi.fn(),
    nowMock: vi.fn(() => "NOW"),
    hashMock: vi.fn(),
    compareMock: vi.fn(),
  }),
);

vi.mock("../../../src/database/connection", () => ({
  default: Object.assign(databaseMock, {
    fn: { now: nowMock },
    transaction: transactionMock,
  }),
}));

vi.mock("bcryptjs", () => ({
  hash: hashMock,
  compare: compareMock,
}));

describe("user services", () => {
  beforeEach(() => {
    databaseMock.mockReset();
    transactionMock.mockReset();
    nowMock.mockClear();
    hashMock.mockReset();
    compareMock.mockReset();
  });

  it("creates a user when the email is available", async () => {
    const existingUserBuilder = createWhereFirstBuilder(undefined);
    const createdUser = {
      id: 1,
      name: "John",
      email: "john@example.com",
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    };
    const insertBuilder = createInsertBuilder([1]);
    const createdUserBuilder = createWhereSelectFirstBuilder(createdUser);

    databaseMock
      .mockReturnValueOnce(existingUserBuilder)
      .mockReturnValueOnce(insertBuilder)
      .mockReturnValueOnce(createdUserBuilder);
    hashMock.mockResolvedValue("hashed-password");

    const result = await createUserService({
      name: "John",
      email: "john@example.com",
      password: "secret123",
    });

    expect(existingUserBuilder.where).toHaveBeenCalledWith({ email: "john@example.com" });
    expect(hashMock).toHaveBeenCalledWith("secret123", 8);
    expect(insertBuilder.insert).toHaveBeenCalledWith({
      name: "John",
      email: "john@example.com",
      password: "hashed-password",
    });
    expect(createdUserBuilder.where).toHaveBeenCalledWith({ id: 1 });
    expect(createdUserBuilder.select).toHaveBeenCalledWith(
      "id",
      "name",
      "email",
      "created_at",
      "updated_at",
    );
    expect(result).toEqual(createdUser);
  });

  it("rejects user creation when the email already exists", async () => {
    const existingUserBuilder = createWhereFirstBuilder({ id: 99 });

    databaseMock.mockReturnValueOnce(existingUserBuilder);

    await expect(
      createUserService({
        name: "John",
        email: "john@example.com",
        password: "secret123",
      }),
    ).rejects.toMatchObject({
      message: "User already exists.",
      statusCode: 409,
    });
  });

  it("updates a user profile", async () => {
    const currentUser = {
      id: 1,
      name: "John",
      email: "john@example.com",
      password: "current-hash",
    };
    const currentUserBuilder = createWhereFirstBuilder(currentUser);
    const emailAvailabilityBuilder = createWhereFirstBuilder(undefined);
    const updateBuilder = createUpdateBuilder();
    const updatedUserBuilder = createWhereSelectFirstBuilder({
      id: 1,
      name: "John Updated",
      email: "john.updated@example.com",
      created_at: "2026-01-01",
      updated_at: "2026-01-02",
    });

    databaseMock
      .mockReturnValueOnce(currentUserBuilder)
      .mockReturnValueOnce(emailAvailabilityBuilder)
      .mockReturnValueOnce(updateBuilder)
      .mockReturnValueOnce(updatedUserBuilder);

    const result = await updateUserService({
      userId: 1,
      name: "John Updated",
      email: "john.updated@example.com",
    });

    expect(updateBuilder.update).toHaveBeenCalledWith({
      name: "John Updated",
      email: "john.updated@example.com",
      password: "current-hash",
      updated_at: "NOW",
    });
    expect(updatedUserBuilder.where).toHaveBeenCalledWith({ id: 1 });
    expect(updatedUserBuilder.select).toHaveBeenCalledWith(
      "id",
      "name",
      "email",
      "created_at",
      "updated_at",
    );
    expect(nowMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      id: 1,
      name: "John Updated",
      email: "john.updated@example.com",
      created_at: "2026-01-01",
      updated_at: "2026-01-02",
    });
  });

  it("updates the password when the old password is valid", async () => {
    const currentUser = {
      id: 1,
      name: "John",
      email: "john@example.com",
      password: "current-hash",
    };
    const currentUserBuilder = createWhereFirstBuilder(currentUser);
    const updateBuilder = createUpdateBuilder();
    const updatedUserBuilder = createWhereSelectFirstBuilder({
      id: 1,
      name: "John",
      email: "john@example.com",
      created_at: "2026-01-01",
      updated_at: "2026-01-02",
    });

    databaseMock
      .mockReturnValueOnce(currentUserBuilder)
      .mockReturnValueOnce(updateBuilder)
      .mockReturnValueOnce(updatedUserBuilder);
    compareMock.mockResolvedValue(true);
    hashMock.mockResolvedValue("new-hash");

    await updateUserService({
      userId: 1,
      password: "new-secret",
      oldPassword: "current-secret",
    });

    expect(compareMock).toHaveBeenCalledWith("current-secret", "current-hash");
    expect(hashMock).toHaveBeenCalledWith("new-secret", 8);
    expect(updateBuilder.update).toHaveBeenCalledWith({
      name: "John",
      email: "john@example.com",
      password: "new-hash",
      updated_at: "NOW",
    });
  });

  it("rejects an update when the user does not exist", async () => {
    const currentUserBuilder = createWhereFirstBuilder(undefined);

    databaseMock.mockReturnValueOnce(currentUserBuilder);

    await expect(updateUserService({ userId: 1 })).rejects.toMatchObject({
      message: "User not found.",
      statusCode: 404,
    });
  });

  it("rejects an update when the new email is already in use", async () => {
    const currentUserBuilder = createWhereFirstBuilder({
      id: 1,
      name: "John",
      email: "john@example.com",
      password: "current-hash",
    });
    const conflictingUserBuilder = createWhereFirstBuilder({ id: 2 });

    databaseMock
      .mockReturnValueOnce(currentUserBuilder)
      .mockReturnValueOnce(conflictingUserBuilder);

    await expect(
      updateUserService({
        userId: 1,
        email: "taken@example.com",
      }),
    ).rejects.toMatchObject({
      message: "Email already in use.",
      statusCode: 409,
    });
  });

  it("requires the old password before changing to a new password", async () => {
    const currentUserBuilder = createWhereFirstBuilder({
      id: 1,
      name: "John",
      email: "john@example.com",
      password: "current-hash",
    });

    databaseMock.mockReturnValueOnce(currentUserBuilder);

    await expect(
      updateUserService({
        userId: 1,
        password: "new-secret",
      }),
    ).rejects.toMatchObject({
      message: "Old password is required.",
      statusCode: 400,
    });
  });

  it("rejects the password change when the old password does not match", async () => {
    const currentUserBuilder = createWhereFirstBuilder({
      id: 1,
      name: "John",
      email: "john@example.com",
      password: "current-hash",
    });

    databaseMock.mockReturnValueOnce(currentUserBuilder);
    compareMock.mockResolvedValue(false);

    await expect(
      updateUserService({
        userId: 1,
        password: "new-secret",
        oldPassword: "wrong-password",
      }),
    ).rejects.toMatchObject({
      message: "Old password does not match.",
      statusCode: 400,
    });
  });

  it("returns a user by id", async () => {
    const showBuilder = createSelectFirstBuilder({
      id: 1,
      name: "John",
      email: "john@example.com",
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    });

    databaseMock.mockReturnValueOnce(showBuilder);

    const result = await showUserService(1);

    expect(showBuilder.select).toHaveBeenCalledWith(
      "id",
      "name",
      "email",
      "created_at",
      "updated_at",
    );
    expect(result.email).toBe("john@example.com");
  });

  it("rejects when trying to show a missing user", async () => {
    const showBuilder = createSelectFirstBuilder(undefined);

    databaseMock.mockReturnValueOnce(showBuilder);

    await expect(showUserService(1)).rejects.toMatchObject({
      message: "User not found.",
      statusCode: 404,
    });
  });

  it("deletes an existing user", async () => {
    const existingUserBuilder = createWhereFirstBuilder({ id: 1 });
    const deleteBuilder = createDeleteBuilder();

    databaseMock
      .mockReturnValueOnce(existingUserBuilder)
      .mockReturnValueOnce(deleteBuilder);

    await deleteUserService(1);

    expect(deleteBuilder.where).toHaveBeenCalledWith({ id: 1 });
    expect(deleteBuilder.delete).toHaveBeenCalledTimes(1);
  });

  it("rejects when trying to delete a missing user", async () => {
    const existingUserBuilder = createWhereFirstBuilder(undefined);

    databaseMock.mockReturnValueOnce(existingUserBuilder);

    await expect(deleteUserService(1)).rejects.toMatchObject({
      message: "User not found.",
      statusCode: 404,
    });
  });
});
