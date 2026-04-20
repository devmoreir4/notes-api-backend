import type { Request, Response } from "express";
import { listTagsService } from "../services/tags/list-tags-service";
import { ensurePositiveInteger } from "../utils/validation";

class TagsController {
  index = async (request: Request, response: Response) => {
    const userId = ensurePositiveInteger(request.params.user_id, "user_id");
    const tags = await listTagsService(userId);

    return response.json(tags);
  };
}

export default new TagsController();
