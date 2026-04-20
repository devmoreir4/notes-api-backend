import { beforeEach, describe, expect, it, vi } from "vitest";
import { listTagsService } from "../../../src/services/tags/list-tags-service";
import { createOrderedRowsBuilder } from "../../support/query-builders";

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

describe("tag services", () => {
  beforeEach(() => {
    databaseMock.mockReset();
    transactionMock.mockReset();
    nowMock.mockClear();
  });

  it("lists the tags for a user ordered by name", async () => {
    const tagsBuilder = createOrderedRowsBuilder([
      { id: 1, name: "focus", note_id: 10, user_id: 1, created_at: "", updated_at: "" },
      { id: 2, name: "study", note_id: 10, user_id: 1, created_at: "", updated_at: "" },
    ]);

    databaseMock.mockReturnValueOnce(tagsBuilder);

    const result = await listTagsService(1);

    expect(tagsBuilder.select).toHaveBeenCalledWith(
      "id",
      "name",
      "note_id",
      "user_id",
      "created_at",
      "updated_at",
    );
    expect(tagsBuilder.where).toHaveBeenCalledWith({ user_id: 1 });
    expect(tagsBuilder.orderBy).toHaveBeenCalledWith("name");
    expect(result).toHaveLength(2);
  });
});
