import { Router } from "express";
import notesRoutes from "./notes.routes";
import tagsRoutes from "./tags.routes";
import usersRoutes from "./users.routes";

const routes = Router();

routes.get("/", (_request, response) => {
  return response.json({
    name: "notes-api",
    version: "2.0.0",
    status: "ok",
  });
});

routes.get("/health", (_request, response) => {
  return response.json({
    status: "ok",
    uptime: process.uptime(),
  });
});

routes.use("/users", usersRoutes);
routes.use("/notes", notesRoutes);
routes.use("/tags", tagsRoutes);

export default routes;
