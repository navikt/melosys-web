import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "./mediaQuery";

describe("mediaQuery utils", () => {
  let matchMediaMock: {
    matches: boolean;
    media: string;
    addListener: ReturnType<typeof vi.fn>;
    removeListener: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    dispatchEvent: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    matchMediaMock = {
      matches: false,
      media: "",
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => {
        matchMediaMock.media = query;
        return matchMediaMock;
      }),
    });
  });

  describe("useMediaQuery hook", () => {
    it("skal returnere false når media query ikke matcher", () => {
      matchMediaMock.matches = false;

      const { result } = renderHook(() => useMediaQuery({ minWidth: 768 }));

      expect(result.current).toBe(false);
    });

    it("skal returnere true når media query matcher", () => {
      matchMediaMock.matches = true;

      const { result } = renderHook(() => useMediaQuery({ minWidth: 768 }));

      expect(result.current).toBe(true);
    });

    it("skal generere riktig query string for minWidth", () => {
      renderHook(() => useMediaQuery({ minWidth: 768 }));

      expect(window.matchMedia).toHaveBeenCalledWith("(min-width:768px)");
    });

    it("skal generere riktig query string for maxWidth", () => {
      renderHook(() => useMediaQuery({ maxWidth: 1024 }));

      expect(window.matchMedia).toHaveBeenCalledWith("(max-width:1024px)");
    });

    it("skal generere riktig query string for både minWidth og maxWidth", () => {
      renderHook(() => useMediaQuery({ minWidth: 768, maxWidth: 1024 }));

      expect(window.matchMedia).toHaveBeenCalledWith("(min-width:768px) and (max-width:1024px)");
    });

    it("skal legge til event listener ved mount", () => {
      renderHook(() => useMediaQuery({ minWidth: 768 }));

      expect(matchMediaMock.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });

    it("skal fjerne event listener ved unmount", () => {
      const { unmount } = renderHook(() => useMediaQuery({ minWidth: 768 }));

      unmount();

      expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });

    it("skal oppdatere matches når media query endres", () => {
      matchMediaMock.matches = false;

      const { result, rerender } = renderHook(() => useMediaQuery({ minWidth: 768 }));

      expect(result.current).toBe(false);

      // Simuler endring i media query
      matchMediaMock.matches = true;
      const listener = matchMediaMock.addEventListener.mock.calls[0][1];

      act(() => {
        listener();
      });

      rerender();

      expect(result.current).toBe(true);
    });

    it("skal håndtere tom query", () => {
      renderHook(() => useMediaQuery({}));

      expect(window.matchMedia).toHaveBeenCalledWith("");
    });

    it("skal kalle matchMedia med ny query når props endres", () => {
      const { rerender } = renderHook(({ query }) => useMediaQuery(query), {
        initialProps: { query: { minWidth: 768 } },
      });

      expect(window.matchMedia).toHaveBeenCalledWith("(min-width:768px)");

      rerender({ query: { minWidth: 1024 } });

      expect(window.matchMedia).toHaveBeenCalledWith("(min-width:1024px)");
    });

    it("skal håndtere minWidth 0", () => {
      renderHook(() => useMediaQuery({ minWidth: 0 }));

      // 0 er falsy, så det skal ikke inkluderes i query string
      expect(window.matchMedia).toHaveBeenCalledWith("");
    });

    it("skal håndtere maxWidth 0", () => {
      renderHook(() => useMediaQuery({ maxWidth: 0 }));

      // 0 er falsy, så det skal ikke inkluderes i query string
      expect(window.matchMedia).toHaveBeenCalledWith("");
    });

    it("skal generere query med kun minWidth når maxWidth er 0", () => {
      renderHook(() => useMediaQuery({ minWidth: 768, maxWidth: 0 }));

      expect(window.matchMedia).toHaveBeenCalledWith("(min-width:768px)");
    });

    it("skal generere query med kun maxWidth når minWidth er 0", () => {
      renderHook(() => useMediaQuery({ minWidth: 0, maxWidth: 1024 }));

      expect(window.matchMedia).toHaveBeenCalledWith("(max-width:1024px)");
    });
  });
});
