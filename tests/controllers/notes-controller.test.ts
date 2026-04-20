import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createNoteServiceMock,
  listNotesServiceMock,
  showNoteServiceMock,
  deleteNoteServiceMock,
} = vi.hoisted(() => ({
  createNoteServiceMock: vi.fn(),
  listNotesServiceMock: vi.fn(),
  showNoteServiceMock: vi.fn(),
  deleteNoteServiceMock: vi.fn(),
}));

vi.mock("../../src/services/notes/create-note-service", () => ({
  createNoteService: createNoteServiceMock,
}));

vi.mock("../../src/services/notes/list-notes-service", () => ({
  listNotesService: listNotesServiceMock,
}));

vi.mock("../../src/services/notes/show-note-service", () => ({
  showNoteService: showNoteServiceMock,
}));

vi.mock("../../src/services/notes/delete-note-service", () => ({
  deleteNoteService: deleteNoteServiceMock,
}));

import notesController from "../../src/controllers/notes-controller";

function createResponseMock(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

describe("notes controller", () => {
  beforeEach(() => {
    createNoteServiceMock.mockReset();
    listNotesServiceMock.mockReset();
    showNoteServiceMock.mockReset();
    deleteNoteServiceMock.mockReset();
  });

  it("creates a note and returns 201", async () => {
    const response = createResponseMock();
    const note = { id: 10, title: "Study", description: "Deep work", user_id: 1 };

    createNoteServiceMock.mockResolvedValue(note);

    await notesController.create(
      {
        params: { user_id: "1" },
        body: {
          title: "Study",
          description: "Deep work",
          tags: ["study"],
          links: ["https://example.com"],
        },
      } as unknown as Request,
      response,
    );

    expect(createNoteServiceMock).toHaveBeenCalledWith({
      userId: 1,
      title: "Study",
      description: "Deep work",
      tags: ["study"],
      links: ["https://example.com"],
    });
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(note);
  });

  it("lists notes using query filters", async () => {
    const response = createResponseMock();
    const notes = [{ id: 10, title: "Study" }];

    listNotesServiceMock.mockResolvedValue(notes);

    await notesController.index(
      {
        query: {
          user_id: "1",
          title: "Stu",
          tags: "study,work",
        },
      } as unknown as Request,
      response,
    );

    expect(listNotesServiceMock).toHaveBeenCalledWith({
      userId: 1,
      title: "Stu",
      tags: ["study", "work"],
    });
    expect(response.json).toHaveBeenCalledWith(notes);
  });

  it("shows a note by id", async () => {
    const response = createResponseMock();
    const note = { id: 10, title: "Study" };

    showNoteServiceMock.mockResolvedValue(note);

    await notesController.show(
      {
        params: { id: "10" },
      } as unknown as Request,
      response,
    );

    expect(showNoteServiceMock).toHaveBeenCalledWith(10);
    expect(response.json).toHaveBeenCalledWith(note);
  });

  it("deletes a note and returns 204", async () => {
    const response = createResponseMock();

    deleteNoteServiceMock.mockResolvedValue(undefined);

    await notesController.delete(
      {
        params: { id: "10" },
      } as unknown as Request,
      response,
    );

    expect(deleteNoteServiceMock).toHaveBeenCalledWith(10);
    expect(response.status).toHaveBeenCalledWith(204);
    expect(response.send).toHaveBeenCalledTimes(1);
  });
});
