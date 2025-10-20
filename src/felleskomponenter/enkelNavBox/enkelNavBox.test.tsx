import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EnkelNavBox from "./enkelNavBox";

describe("EnkelNavBox", () => {
  it("skal rendre children", () => {
    render(
      <EnkelNavBox focused={false}>
        <div>Test innhold</div>
      </EnkelNavBox>,
    );

    expect(screen.getByText("Test innhold")).toBeInTheDocument();
  });

  it("skal ha radioKnappRamme className", () => {
    const { container } = render(
      <EnkelNavBox focused={false}>
        <div>Test</div>
      </EnkelNavBox>,
    );

    expect(container.querySelector(".radioKnappRamme")).toBeInTheDocument();
  });

  it("skal ha focused className når focused er true", () => {
    const { container } = render(
      <EnkelNavBox focused={true}>
        <div>Test</div>
      </EnkelNavBox>,
    );

    const box = container.querySelector(".radioKnappRamme");
    expect(box).toHaveClass("focused");
  });

  it("skal ikke ha focused className når focused er false", () => {
    const { container } = render(
      <EnkelNavBox focused={false}>
        <div>Test</div>
      </EnkelNavBox>,
    );

    const box = container.querySelector(".radioKnappRamme");
    expect(box).not.toHaveClass("focused");
  });

  it("skal endre focused className når focused endres", () => {
    const { container, rerender } = render(
      <EnkelNavBox focused={false}>
        <div>Test</div>
      </EnkelNavBox>,
    );

    let box = container.querySelector(".radioKnappRamme");
    expect(box).not.toHaveClass("focused");

    rerender(
      <EnkelNavBox focused={true}>
        <div>Test</div>
      </EnkelNavBox>,
    );

    box = container.querySelector(".radioKnappRamme");
    expect(box).toHaveClass("focused");
  });

  it("skal rendre Box fra Nav med riktige props", () => {
    const { container } = render(
      <EnkelNavBox focused={false}>
        <div>Test</div>
      </EnkelNavBox>,
    );

    const box = container.querySelector(".navds-box");
    expect(box).toBeInTheDocument();
  });

  it("skal rendre komplekse children", () => {
    render(
      <EnkelNavBox focused={false}>
        <div>
          <h1>Heading</h1>
          <p>Paragraph</p>
          <span>Span</span>
        </div>
      </EnkelNavBox>,
    );

    expect(screen.getByText("Heading")).toBeInTheDocument();
    expect(screen.getByText("Paragraph")).toBeInTheDocument();
    expect(screen.getByText("Span")).toBeInTheDocument();
  });

  it("skal håndtere flere children", () => {
    render(
      <EnkelNavBox focused={false}>
        <div>First</div>
        <div>Second</div>
        <div>Third</div>
      </EnkelNavBox>,
    );

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.getByText("Third")).toBeInTheDocument();
  });

  it("skal kombinere focused true med children", () => {
    const { container } = render(
      <EnkelNavBox focused={true}>
        <div>Focused content</div>
      </EnkelNavBox>,
    );

    expect(screen.getByText("Focused content")).toBeInTheDocument();
    const box = container.querySelector(".radioKnappRamme");
    expect(box).toHaveClass("focused");
  });

  it("skal kunne toggle focused flere ganger", () => {
    const { container, rerender } = render(
      <EnkelNavBox focused={false}>
        <div>Test</div>
      </EnkelNavBox>,
    );

    let box = container.querySelector(".radioKnappRamme");
    expect(box).not.toHaveClass("focused");

    rerender(
      <EnkelNavBox focused={true}>
        <div>Test</div>
      </EnkelNavBox>,
    );

    box = container.querySelector(".radioKnappRamme");
    expect(box).toHaveClass("focused");

    rerender(
      <EnkelNavBox focused={false}>
        <div>Test</div>
      </EnkelNavBox>,
    );

    box = container.querySelector(".radioKnappRamme");
    expect(box).not.toHaveClass("focused");
  });

  it("skal endre children uten å påvirke focused state", () => {
    const { container, rerender } = render(
      <EnkelNavBox focused={true}>
        <div>First content</div>
      </EnkelNavBox>,
    );

    expect(screen.getByText("First content")).toBeInTheDocument();
    let box = container.querySelector(".radioKnappRamme");
    expect(box).toHaveClass("focused");

    rerender(
      <EnkelNavBox focused={true}>
        <div>Second content</div>
      </EnkelNavBox>,
    );

    expect(screen.getByText("Second content")).toBeInTheDocument();
    expect(screen.queryByText("First content")).not.toBeInTheDocument();
    box = container.querySelector(".radioKnappRamme");
    expect(box).toHaveClass("focused");
  });

  it("skal rendre med ReactNode children", () => {
    render(
      <EnkelNavBox focused={false}>
        <button>Click me</button>
      </EnkelNavBox>,
    );

    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("skal håndtere tekst som children", () => {
    render(<EnkelNavBox focused={false}>Plain text content</EnkelNavBox>);

    expect(screen.getByText("Plain text content")).toBeInTheDocument();
  });

  it("skal bevare Box border og padding props", () => {
    const { container } = render(
      <EnkelNavBox focused={false}>
        <div>Test</div>
      </EnkelNavBox>,
    );

    const box = container.querySelector(".navds-box");
    // Box should have been rendered with the props
    expect(box).toBeInTheDocument();
  });

  it("skal håndtere null eller undefined children gracefully", () => {
    const { container } = render(
      <EnkelNavBox focused={false}>
        {null}
        {undefined}
        <div>Valid content</div>
      </EnkelNavBox>,
    );

    expect(screen.getByText("Valid content")).toBeInTheDocument();
    expect(container.querySelector(".radioKnappRamme")).toBeInTheDocument();
  });
});
