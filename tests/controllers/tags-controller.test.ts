import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { listTagsServiceMock } = vi.hoisted(() => ({
  listTagsServiceMock: vi.fn(),
}));

vi.mock("../../src/services/tags/list-tags-service", () => ({
  listTagsService: listTagsServiceMock,
}));

import tagsController from "../../src/controllers/tags-controller";

function createResponseMock(): Response {
  return {
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

describe("tags controller", () => {
  beforeEach(() => {
    listTagsServiceMock.mockReset();
  });

  it("lists tags for a user", async () => {
    const response = createResponseMock();
    const tags = [{ id: 1, name: "study", note_id: 10, user_id: 1 }];

    listTagsServiceMock.mockResolvedValue(tags);

    await tagsController.index(
      {
        params: { user_id: "1" },
      } as unknown as Request,
      response,
    );

    expect(listTagsServiceMock).toHaveBeenCalledWith(1);
    expect(response.json).toHaveBeenCalledWith(tags);
  });
});
