import { Router } from "express";
import notesController from "../controllers/notes-controller";

const notesRoutes = Router();

notesRoutes.get("/", notesController.index);
notesRoutes.post("/:user_id", notesController.create);
notesRoutes.get("/:id", notesController.show);
notesRoutes.delete("/:id", notesController.delete);

export default notesRoutes;
