import type { Request, Response } from "express";
import { AppError } from "../../src/errors/app-error";
import { errorHandler } from "../../src/middlewares/error-handler";

describe("error handler middleware", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  function createResponseMock() {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    return response as unknown as Response;
  }

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("returns the status code and message for AppError", async () => {
    const response = createResponseMock();

    errorHandler(new AppError("Handled failure.", 422), {} as Request, response, vi.fn());

    expect(response.status).toHaveBeenCalledWith(422);
    expect(response.json).toHaveBeenCalledWith({
      status: "error",
      message: "Handled failure.",
    });
  });

  it("returns a generic 500 response for unexpected errors", async () => {
    const response = createResponseMock();
    const error = new Error("Unexpected failure.");

    errorHandler(error, {} as Request, response, vi.fn());

    expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      status: "error",
      message: "Internal server error.",
    });
  });
});
