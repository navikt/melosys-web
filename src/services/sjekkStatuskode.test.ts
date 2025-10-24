import { describe, it, expect } from "vitest";
import sjekkStatuskode, { isApiError } from "./sjekkStatuskode";

describe("sjekkStatuskode", () => {
  describe("sjekkStatuskode", () => {
    it("skal returnere response for 200 OK", async () => {
      const mockResponse = {
        status: 200,
        ok: true,
        redirected: false,
        statusText: "OK",
        type: "basic",
      } as Response;

      const result = await sjekkStatuskode(mockResponse);

      expect(result).toBe(mockResponse);
    });

    it("skal returnere response for 201 Created", async () => {
      const mockResponse = {
        status: 201,
        ok: true,
        redirected: false,
        statusText: "Created",
        type: "basic",
      } as Response;

      const result = await sjekkStatuskode(mockResponse);

      expect(result).toBe(mockResponse);
    });

    it("skal returnere response for 204 No Content", async () => {
      const mockResponse = {
        status: 204,
        ok: true,
        redirected: false,
        statusText: "No Content",
        type: "basic",
      } as Response;

      const result = await sjekkStatuskode(mockResponse);

      expect(result).toBe(mockResponse);
    });

    it("skal returnere response for 299 (edge case under 300)", async () => {
      const mockResponse = {
        status: 299,
        ok: true,
        redirected: false,
        statusText: "OK",
        type: "basic",
      } as Response;

      const result = await sjekkStatuskode(mockResponse);

      expect(result).toBe(mockResponse);
    });

    it("skal kaste ApiError for 400 Bad Request", async () => {
      const errorBody = { message: "Bad request" };
      const mockResponse = {
        status: 400,
        ok: false,
        redirected: false,
        statusText: "Bad Request",
        type: "basic",
        clone: () => ({
          json: async () => errorBody,
        }),
      } as any;

      await expect(sjekkStatuskode(mockResponse)).rejects.toThrow("Bad Request");
    });

    it("skal kaste ApiError for 401 Unauthorized", async () => {
      const errorBody = { message: "Unauthorized" };
      const mockResponse = {
        status: 401,
        ok: false,
        redirected: false,
        statusText: "Unauthorized",
        type: "basic",
        clone: () => ({
          json: async () => errorBody,
        }),
      } as any;

      await expect(sjekkStatuskode(mockResponse)).rejects.toThrow("Unauthorized");
    });

    it("skal kaste ApiError for 403 Forbidden", async () => {
      const errorBody = { message: "Forbidden" };
      const mockResponse = {
        status: 403,
        ok: false,
        redirected: false,
        statusText: "Forbidden",
        type: "basic",
        clone: () => ({
          json: async () => errorBody,
        }),
      } as any;

      await expect(sjekkStatuskode(mockResponse)).rejects.toThrow("Forbidden");
    });

    it("skal kaste ApiError for 404 Not Found", async () => {
      const errorBody = { message: "Not found" };
      const mockResponse = {
        status: 404,
        ok: false,
        redirected: false,
        statusText: "Not Found",
        type: "basic",
        clone: () => ({
          json: async () => errorBody,
        }),
      } as any;

      await expect(sjekkStatuskode(mockResponse)).rejects.toThrow("Not Found");
    });

    it("skal kaste ApiError for 500 Internal Server Error", async () => {
      const errorBody = { message: "Internal server error" };
      const mockResponse = {
        status: 500,
        ok: false,
        redirected: false,
        statusText: "Internal Server Error",
        type: "basic",
        clone: () => ({
          json: async () => errorBody,
        }),
      } as any;

      await expect(sjekkStatuskode(mockResponse)).rejects.toThrow("Internal Server Error");
    });

    it("skal bruke type hvis statusText er tom", async () => {
      const errorBody = { message: "Error" };
      const mockResponse = {
        status: 400,
        ok: false,
        redirected: false,
        statusText: "",
        type: "error",
        clone: () => ({
          json: async () => errorBody,
        }),
      } as any;

      await expect(sjekkStatuskode(mockResponse)).rejects.toThrow("error");
    });

    it("skal kaste ApiError når response er redirected", async () => {
      const errorBody = { message: "Redirected" };
      const mockResponse = {
        status: 200,
        ok: true,
        redirected: true,
        statusText: "OK",
        type: "basic",
        clone: () => ({
          json: async () => errorBody,
        }),
      } as any;

      await expect(sjekkStatuskode(mockResponse)).rejects.toThrow();
    });

    it("skal kaste ApiError når ok er false", async () => {
      const errorBody = { message: "Not OK" };
      const mockResponse = {
        status: 200,
        ok: false,
        redirected: false,
        statusText: "OK",
        type: "basic",
        clone: () => ({
          json: async () => errorBody,
        }),
      } as any;

      await expect(sjekkStatuskode(mockResponse)).rejects.toThrow();
    });

    it("skal inkludere status i ApiError", async () => {
      const errorBody = { message: "Error" };
      const mockResponse = {
        status: 404,
        ok: false,
        redirected: false,
        statusText: "Not Found",
        type: "basic",
        clone: () => ({
          json: async () => errorBody,
        }),
      } as any;

      try {
        await sjekkStatuskode(mockResponse);
        expect.fail("Should have thrown");
      } catch (error: any) {
        expect(error.status).toBe(404);
      }
    });

    it("skal inkludere body i ApiError", async () => {
      const errorBody = { message: "Custom error message", code: "ERR_001" };
      const mockResponse = {
        status: 400,
        ok: false,
        redirected: false,
        statusText: "Bad Request",
        type: "basic",
        clone: () => ({
          json: async () => errorBody,
        }),
      } as any;

      try {
        await sjekkStatuskode(mockResponse);
        expect.fail("Should have thrown");
      } catch (error: any) {
        expect(error.body).toEqual(errorBody);
        expect(error.body.message).toBe("Custom error message");
        expect(error.body.code).toBe("ERR_001");
      }
    });

    it("skal inkludere response objekt i ApiError", async () => {
      const errorBody = { message: "Error" };
      const mockResponse = {
        status: 500,
        ok: false,
        redirected: false,
        statusText: "Internal Server Error",
        type: "basic",
        clone: () => ({
          json: async () => errorBody,
        }),
      } as any;

      try {
        await sjekkStatuskode(mockResponse);
        expect.fail("Should have thrown");
      } catch (error: any) {
        expect(error.response).toBe(mockResponse);
      }
    });
  });

  describe("isApiError", () => {
    it("skal returnere true for objekt med status number", () => {
      const error = {
        status: 404,
        response: {},
        body: {},
      };

      expect(isApiError(error)).toBe(true);
    });

    it("skal returnere false for vanlig Error", () => {
      const error = new Error("Regular error");

      expect(isApiError(error)).toBe(false);
    });

    it("skal returnere false for objekt uten status", () => {
      const error = {
        message: "Error",
        code: 404,
      };

      expect(isApiError(error)).toBe(false);
    });

    it("skal returnere false for objekt med status som string", () => {
      const error = {
        status: "404",
      };

      expect(isApiError(error)).toBe(false);
    });

    it("skal returnere true for objekt med status 0", () => {
      const error = {
        status: 0,
      };

      expect(isApiError(error)).toBe(true);
    });

    it("skal returnere true for ApiError med alle properties", () => {
      const error = {
        status: 500,
        response: {},
        body: { message: "Error" },
        message: "Internal Server Error",
      };

      expect(isApiError(error)).toBe(true);
    });

    it("skal kunne brukes i type guard", () => {
      const error: any = {
        status: 404,
        body: { message: "Not found" },
      };

      if (isApiError(error)) {
        // TypeScript should know error has status property
        expect(error.status).toBe(404);
      } else {
        expect.fail("Should be ApiError");
      }
    });
  });
});
