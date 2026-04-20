import type { Request, Response } from "express";
import { createNoteService } from "../services/notes/create-note-service";
import { deleteNoteService } from "../services/notes/delete-note-service";
import { listNotesService } from "../services/notes/list-notes-service";
import { showNoteService } from "../services/notes/show-note-service";
import {
  ensureNonEmptyString,
  ensureObjectBody,
  ensureOptionalQueryString,
  ensureOptionalString,
  ensurePositiveInteger,
  ensureStringArray,
  ensureTagsQuery,
} from "../utils/validation";

class NotesController {
  create = async (request: Request, response: Response) => {
    const body = ensureObjectBody(request.body);
    const userId = ensurePositiveInteger(request.params.user_id, "user_id");

    const note = await createNoteService({
      userId,
      title: ensureNonEmptyString(body.title, "title"),
      description: ensureOptionalString(body.description, "description"),
      tags: ensureStringArray(body.tags, "tags"),
      links: ensureStringArray(body.links, "links"),
    });

    return response.status(201).json(note);
  };

  show = async (request: Request, response: Response) => {
    const noteId = ensurePositiveInteger(request.params.id, "id");
    const note = await showNoteService(noteId);

    return response.json(note);
  };

  delete = async (request: Request, response: Response) => {
    const noteId = ensurePositiveInteger(request.params.id, "id");

    await deleteNoteService(noteId);

    return response.status(204).send();
  };

  index = async (request: Request, response: Response) => {
    const userId = ensurePositiveInteger(request.query.user_id, "user_id");
    const title = ensureOptionalQueryString(request.query.title);
    const tags = ensureTagsQuery(request.query.tags);

    const notes = await listNotesService({
      userId,
      title,
      tags,
    });

    return response.json(notes);
  };
}

export default new NotesController();
