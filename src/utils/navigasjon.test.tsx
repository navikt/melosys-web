import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { finnFokuserbareElementer, flyttFokusTilHtmlElement, flyttFokusTilHtmlElementFraId } from "./navigasjon";

describe("navigasjon utils", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("finnFokuserbareElementer", () => {
    it("skal finne button elementer", () => {
      container.innerHTML = `
        <button>Knapp 1</button>
        <button>Knapp 2</button>
      `;

      const elementer = finnFokuserbareElementer(container);
      expect(elementer).toHaveLength(2);
    });

    it("skal finne link elementer", () => {
      container.innerHTML = `
        <a href="/test">Link 1</a>
        <a href="/test2">Link 2</a>
      `;

      const elementer = finnFokuserbareElementer(container);
      expect(elementer).toHaveLength(2);
    });

    it("skal finne input elementer", () => {
      container.innerHTML = `
        <input type="text" />
        <input type="checkbox" />
      `;

      const elementer = finnFokuserbareElementer(container);
      expect(elementer).toHaveLength(2);
    });

    it("skal finne select elementer", () => {
      container.innerHTML = `
        <select><option>Option 1</option></select>
      `;

      const elementer = finnFokuserbareElementer(container);
      expect(elementer).toHaveLength(1);
    });

    it("skal finne textarea elementer", () => {
      container.innerHTML = `
        <textarea></textarea>
      `;

      const elementer = finnFokuserbareElementer(container);
      expect(elementer).toHaveLength(1);
    });

    it("skal finne elementer med tabindex", () => {
      container.innerHTML = `
        <div tabindex="0">Div med tabindex</div>
        <span tabindex="1">Span med tabindex</span>
      `;

      const elementer = finnFokuserbareElementer(container);
      expect(elementer).toHaveLength(2);
    });

    it("skal ikke finne elementer med tabindex -1", () => {
      container.innerHTML = `
        <div tabindex="-1">Ikke fokuserbar</div>
        <button>Fokuserbar</button>
      `;

      const elementer = finnFokuserbareElementer(container);
      expect(elementer).toHaveLength(1);
      expect(elementer![0].tagName).toBe("BUTTON");
    });

    it("skal finne alle typer fokusbare elementer sammen", () => {
      container.innerHTML = `
        <button>Knapp</button>
        <a href="/test">Link</a>
        <input type="text" />
        <select><option>Option</option></select>
        <textarea></textarea>
        <div tabindex="0">Div</div>
      `;

      const elementer = finnFokuserbareElementer(container);
      expect(elementer).toHaveLength(6);
    });

    it("skal returnere null når htmlElement er null", () => {
      const elementer = finnFokuserbareElementer(null);
      expect(elementer).toBeNull();
    });

    it("skal returnere null når htmlElement er undefined", () => {
      const elementer = finnFokuserbareElementer(undefined);
      expect(elementer).toBeNull();
    });

    it("skal returnere tom NodeList når ingen fokusbare elementer finnes", () => {
      container.innerHTML = `
        <div>Ikke fokuserbar</div>
        <span>Heller ikke fokuserbar</span>
      `;

      const elementer = finnFokuserbareElementer(container);
      expect(elementer).toHaveLength(0);
    });

    it("skal ikke inkludere nestede ikke-fokusbare elementer i telling", () => {
      container.innerHTML = `
        <button>
          <span>Tekst i knapp</span>
        </button>
      `;

      const elementer = finnFokuserbareElementer(container);
      expect(elementer).toHaveLength(1);
    });
  });

  describe("flyttFokusTilHtmlElement", () => {
    it("skal flytte fokus til første fokusbare element", () => {
      container.innerHTML = `
        <button id="first">Første</button>
        <button id="second">Andre</button>
      `;

      flyttFokusTilHtmlElement(container);

      expect(document.activeElement?.id).toBe("first");
    });

    it("skal håndtere null parameter", () => {
      expect(() => flyttFokusTilHtmlElement(null)).not.toThrow();
    });

    it("skal håndtere undefined parameter", () => {
      expect(() => flyttFokusTilHtmlElement(undefined)).not.toThrow();
    });

    it("skal ikke gjøre noe hvis ingen fokusbare elementer finnes", () => {
      container.innerHTML = `
        <div>Ikke fokuserbar</div>
      `;

      const previousActiveElement = document.activeElement;
      flyttFokusTilHtmlElement(container);

      expect(document.activeElement).toBe(previousActiveElement);
    });

    it("skal flytte fokus til input element", () => {
      container.innerHTML = `
        <input id="test-input" type="text" />
      `;

      flyttFokusTilHtmlElement(container);

      expect(document.activeElement?.id).toBe("test-input");
    });

    it("skal flytte fokus til link element", () => {
      container.innerHTML = `
        <a id="test-link" href="/test">Link</a>
      `;

      flyttFokusTilHtmlElement(container);

      expect(document.activeElement?.id).toBe("test-link");
    });

    it("skal flytte fokus til første element selv om det er mange", () => {
      container.innerHTML = `
        <button id="btn1">1</button>
        <button id="btn2">2</button>
        <button id="btn3">3</button>
      `;

      flyttFokusTilHtmlElement(container);

      expect(document.activeElement?.id).toBe("btn1");
    });
  });

  describe("flyttFokusTilHtmlElementFraId", () => {
    it("skal flytte fokus til element med gitt id", () => {
      container.innerHTML = `
        <div id="target-element">
          <button id="target-button">Knapp</button>
        </div>
      `;

      flyttFokusTilHtmlElementFraId("target-element");

      expect(document.activeElement?.id).toBe("target-button");
    });

    it("skal håndtere null id", () => {
      expect(() => flyttFokusTilHtmlElementFraId(null)).not.toThrow();
    });

    it("skal håndtere undefined id", () => {
      expect(() => flyttFokusTilHtmlElementFraId(undefined)).not.toThrow();
    });

    it("skal håndtere tom streng som id", () => {
      expect(() => flyttFokusTilHtmlElementFraId("")).not.toThrow();
    });

    it("skal håndtere ikke-eksisterende id", () => {
      expect(() => flyttFokusTilHtmlElementFraId("ikke-eksisterende-id")).not.toThrow();
    });

    it("skal bruke document.getElementById", () => {
      const spy = vi.spyOn(document, "getElementById");
      container.innerHTML = `
        <div id="test-container">
          <button>Knapp</button>
        </div>
      `;

      flyttFokusTilHtmlElementFraId("test-container");

      expect(spy).toHaveBeenCalledWith("test-container");
      spy.mockRestore();
    });

    it("skal flytte fokus til første fokusbare element i target", () => {
      container.innerHTML = `
        <div id="wrapper">
          <span>Ikke fokuserbar</span>
          <button id="inside-button">Fokuserbar</button>
        </div>
      `;

      flyttFokusTilHtmlElementFraId("wrapper");

      expect(document.activeElement?.id).toBe("inside-button");
    });
  });
});
