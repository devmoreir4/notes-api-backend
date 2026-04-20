import { beforeEach, describe, expect, it, vi } from "vitest";
import { createNoteService } from "../../../src/services/notes/create-note-service";
import { deleteNoteService } from "../../../src/services/notes/delete-note-service";
import { listNotesService } from "../../../src/services/notes/list-notes-service";
import { showNoteService } from "../../../src/services/notes/show-note-service";
import {
  createDeleteBuilder,
  createInsertBuilder,
  createNotesListBuilder,
  createOrderedRowsBuilder,
  createWhereFirstBuilder,
} from "../../support/query-builders";

const { databaseMock, transactionMock, nowMock } = vi.hoisted(() => ({
  databaseMock: vi.fn(),
  transactionMock: vi.fn(),
  nowMock: vi.fn(() => "NOW"),
}));

vi.mock("../../../src/database/connection", () => ({
  default: Object.assign(databaseMock, {
    fn: { now: nowMock },
    transaction: transactionMock,
  }),
}));

describe("note services", () => {
  beforeEach(() => {
    databaseMock.mockReset();
    transactionMock.mockReset();
    nowMock.mockClear();
  });

  it("creates a note with tags and links inside a transaction", async () => {
    const userBuilder = createWhereFirstBuilder({ id: 1 });
    const noteInsertBuilder = createInsertBuilder([10]);
    const createdNoteBuilder = {
      where: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue({
        id: 10,
        title: "Study plan",
        description: "Deep work",
        user_id: 1,
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      }),
    };
    const tagsInsertBuilder = createInsertBuilder([1, 2]);
    const linksInsertBuilder = createInsertBuilder([1]);
    const trxMock = vi
      .fn()
      .mockReturnValueOnce(noteInsertBuilder)
      .mockReturnValueOnce(createdNoteBuilder)
      .mockReturnValueOnce(tagsInsertBuilder)
      .mockReturnValueOnce(linksInsertBuilder);

    databaseMock.mockReturnValueOnce(userBuilder);
    transactionMock.mockImplementation(async (callback) => callback(trxMock));

    const result = await createNoteService({
      userId: 1,
      title: "Study plan",
      description: "Deep work",
      tags: ["study", "work"],
      links: ["https://example.com"],
    });

    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(noteInsertBuilder.insert).toHaveBeenCalledWith({
      title: "Study plan",
      description: "Deep work",
      user_id: 1,
    });
    expect(createdNoteBuilder.where).toHaveBeenCalledWith({ id: 10 });
    expect(createdNoteBuilder.first).toHaveBeenCalledWith(
      "id",
      "title",
      "description",
      "user_id",
      "created_at",
      "updated_at",
    );
    expect(tagsInsertBuilder.insert).toHaveBeenCalledWith([
      { name: "study", note_id: 10, user_id: 1 },
      { name: "work", note_id: 10, user_id: 1 },
    ]);
    expect(linksInsertBuilder.insert).toHaveBeenCalledWith([
      { url: "https://example.com", note_id: 10 },
    ]);
    expect(result.id).toBe(10);
  });

  it("rejects note creation when the user does not exist", async () => {
    const userBuilder = createWhereFirstBuilder(undefined);

    databaseMock.mockReturnValueOnce(userBuilder);

    await expect(
      createNoteService({
        userId: 1,
        title: "Study plan",
        description: "Deep work",
        tags: [],
        links: [],
      }),
    ).rejects.toMatchObject({
      message: "User not found.",
      statusCode: 404,
    });
  });

  it("returns a note with tags and links", async () => {
    const noteBuilder = createWhereFirstBuilder({
      id: 10,
      title: "Study plan",
      description: "Deep work",
      user_id: 1,
    });
    const tagsBuilder = createOrderedRowsBuilder([
      { id: 1, name: "study", note_id: 10, user_id: 1, created_at: "", updated_at: "" },
    ]);
    const linksBuilder = createOrderedRowsBuilder([
      { id: 1, url: "https://example.com", note_id: 10, created_at: "", updated_at: "" },
    ]);

    databaseMock
      .mockReturnValueOnce(noteBuilder)
      .mockReturnValueOnce(tagsBuilder)
      .mockReturnValueOnce(linksBuilder);

    const result = await showNoteService(10);

    expect(result.tags).toHaveLength(1);
    expect(result.links).toHaveLength(1);
    expect(tagsBuilder.orderBy).toHaveBeenCalledWith("name");
    expect(linksBuilder.orderBy).toHaveBeenCalledWith("created_at");
  });

  it("rejects when trying to show a missing note", async () => {
    const noteBuilder = createWhereFirstBuilder(undefined);

    databaseMock.mockReturnValueOnce(noteBuilder);

    await expect(showNoteService(10)).rejects.toMatchObject({
      message: "Note not found.",
      statusCode: 404,
    });
  });

  it("deletes an existing note", async () => {
    const noteBuilder = createWhereFirstBuilder({ id: 10 });
    const deleteBuilder = createDeleteBuilder();

    databaseMock.mockReturnValueOnce(noteBuilder).mockReturnValueOnce(deleteBuilder);

    await deleteNoteService(10);

    expect(deleteBuilder.where).toHaveBeenCalledWith({ id: 10 });
    expect(deleteBuilder.delete).toHaveBeenCalledTimes(1);
  });

  it("rejects when trying to delete a missing note", async () => {
    const noteBuilder = createWhereFirstBuilder(undefined);

    databaseMock.mockReturnValueOnce(noteBuilder);

    await expect(deleteNoteService(10)).rejects.toMatchObject({
      message: "Note not found.",
      statusCode: 404,
    });
  });

  it("returns an empty list when there are no notes", async () => {
    const notesBuilder = createNotesListBuilder([]);

    databaseMock.mockReturnValueOnce(notesBuilder);

    const result = await listNotesService({
      userId: 1,
      title: undefined,
      tags: [],
    });

    expect(result).toEqual([]);
  });

  it("lists notes and attaches the corresponding tags", async () => {
    const notesBuilder = createNotesListBuilder([
      {
        id: 10,
        title: "Study plan",
        description: "Deep work",
        user_id: 1,
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      },
    ]);
    const tagsBuilder = createOrderedRowsBuilder([
      { id: 1, name: "study", note_id: 10, user_id: 1 },
      { id: 2, name: "focus", note_id: 10, user_id: 1 },
    ]);

    databaseMock.mockReturnValueOnce(notesBuilder).mockReturnValueOnce(tagsBuilder);

    const result = await listNotesService({
      userId: 1,
      title: "Study",
      tags: ["study", "focus"],
    });

    expect(notesBuilder.where).toHaveBeenCalledWith("notes.user_id", 1);
    expect(notesBuilder.whereILike).toHaveBeenCalledWith("notes.title", "%Study%");
    expect(notesBuilder.innerJoin).toHaveBeenCalledWith(
      "tags",
      "tags.note_id",
      "notes.id",
    );
    expect(notesBuilder.whereIn).toHaveBeenCalledWith("tags.name", ["study", "focus"]);
    expect(notesBuilder.havingRaw).toHaveBeenCalledWith(
      "COUNT(DISTINCT tags.name) = ?",
      [2],
    );
    expect(tagsBuilder.whereIn).toHaveBeenCalledWith("note_id", [10]);
    expect(result).toEqual([
      {
        id: 10,
        title: "Study plan",
        description: "Deep work",
        user_id: 1,
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
        tags: [
          { id: 1, name: "study", note_id: 10, user_id: 1 },
          { id: 2, name: "focus", note_id: 10, user_id: 1 },
        ],
      },
    ]);
  });
});
