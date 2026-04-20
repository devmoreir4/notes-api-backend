import { Router } from "express";
import tagsController from "../controllers/tags-controller";

const tagsRoutes = Router();

tagsRoutes.get("/:user_id", tagsController.index);

export default tagsRoutes;
