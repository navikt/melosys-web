import { describe, it, expect } from "vitest";
import bemUtils from "./index";

describe("bemUtils", () => {
  const bem = bemUtils("my-component");

  it("block returnerer klassenavnet", () => {
    expect(bem.block).toBe("my-component");
  });

  it("element returnerer block__element", () => {
    expect(bem.element("header")).toBe("my-component__header");
  });

  it("modifier returnerer block--modifier", () => {
    expect(bem.modifier("active")).toBe("my-component--active");
  });

  it("elementWithModifier returnerer element og element--modifier", () => {
    expect(bem.elementWithModifier("header", "active")).toBe("my-component__header my-component__header--active");
  });
});
