import { Router } from "express";
import usersController from "../controllers/users-controller";

const usersRoutes = Router();

usersRoutes.post("/", usersController.create);
usersRoutes.put("/:id", usersController.update);
usersRoutes.get("/:id", usersController.show);
usersRoutes.delete("/:id", usersController.delete);

export default usersRoutes;
