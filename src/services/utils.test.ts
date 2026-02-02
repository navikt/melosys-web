import { describe, it, expect, beforeEach } from "vitest";
import { STATUS, getCookie } from "./utils";

describe("services/utils", () => {
  describe("STATUS constants", () => {
    it("skal ha NOT_STARTED status", () => {
      expect(STATUS.NOT_STARTED).toBe("NOT_STARTED");
    });

    it("skal ha PENDING status", () => {
      expect(STATUS.PENDING).toBe("PENDING");
    });

    it("skal ha OK status", () => {
      expect(STATUS.OK).toBe("OK");
    });

    it("skal ha RELOADING status", () => {
      expect(STATUS.RELOADING).toBe("RELOADING");
    });

    it("skal ha ERROR status", () => {
      expect(STATUS.ERROR).toBe("ERROR");
    });
  });

  describe("getCookie", () => {
    beforeEach(() => {
      // Clear cookies before each test
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    });

    it("skal hente cookie med gitt navn", () => {
      document.cookie = "testCookie=testValue";
      const result = getCookie("testCookie");

      expect(result).toBe("testValue");
    });

    it("skal returnere tom string for cookie som ikke finnes", () => {
      const result = getCookie("nonExistentCookie");

      expect(result).toBe("");
    });

    it("skal hente riktig cookie når flere cookies finnes", () => {
      document.cookie = "cookie1=value1";
      document.cookie = "cookie2=value2";
      document.cookie = "cookie3=value3";

      expect(getCookie("cookie1")).toBe("value1");
      expect(getCookie("cookie2")).toBe("value2");
      expect(getCookie("cookie3")).toBe("value3");
    });

    it("skal håndtere cookie med spesialtegn i verdien", () => {
      document.cookie = "specialCookie=value%20with%20spaces";
      const result = getCookie("specialCookie");

      expect(result).toBe("value%20with%20spaces");
    });

    it("skal returnere tom string når document.cookie er tom", () => {
      // Ensure cookies are cleared
      const result = getCookie("anyCookie");

      expect(result).toBe("");
    });
  });
});
