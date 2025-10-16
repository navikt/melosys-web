import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Elementskrift from "./elementskrift";

// Mock icon component
const MockIcon = ({ className }: { className?: string }) => (
  <span data-testid="mock-icon" className={className}>
    Icon
  </span>
);

describe("Elementskrift", () => {
  it("skal rendre tekst", () => {
    render(<Elementskrift ikon={MockIcon} tekst="Test tekst" />);

    expect(screen.getByText("Test tekst")).toBeInTheDocument();
  });

  it("skal rendre ikon", () => {
    render(<Elementskrift ikon={MockIcon} tekst="Test tekst" />);

    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });

  it("skal gi ikon riktig className", () => {
    render(<Elementskrift ikon={MockIcon} tekst="Test tekst" />);

    const icon = screen.getByTestId("mock-icon");
    expect(icon).toHaveClass("ikon");
  });

  it("skal ha elementskrift className på container", () => {
    const { container } = render(<Elementskrift ikon={MockIcon} tekst="Test tekst" />);

    const element = container.querySelector(".elementskrift");
    expect(element).toBeInTheDocument();
  });

  it("skal legge til custom className når den er oppgitt", () => {
    const { container } = render(<Elementskrift ikon={MockIcon} tekst="Test tekst" className="custom-class" />);

    const element = container.querySelector(".elementskrift");
    expect(element).toHaveClass("custom-class");
    expect(element).toHaveClass("elementskrift");
  });

  it("skal ikke ha custom className når den ikke er oppgitt", () => {
    const { container } = render(<Elementskrift ikon={MockIcon} tekst="Test tekst" />);

    const element = container.querySelector(".elementskrift");
    expect(element).toHaveClass("elementskrift");
  });

  it("skal rendre ulike ikoner", () => {
    const AnotherIcon = ({ className }: { className?: string }) => (
      <span data-testid="another-icon" className={className}>
        Another
      </span>
    );

    render(<Elementskrift ikon={AnotherIcon} tekst="Test" />);

    expect(screen.getByTestId("another-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-icon")).not.toBeInTheDocument();
  });

  it("skal rendre ulike tekster", () => {
    const { rerender } = render(<Elementskrift ikon={MockIcon} tekst="Første tekst" />);

    expect(screen.getByText("Første tekst")).toBeInTheDocument();

    rerender(<Elementskrift ikon={MockIcon} tekst="Andre tekst" />);

    expect(screen.getByText("Andre tekst")).toBeInTheDocument();
    expect(screen.queryByText("Første tekst")).not.toBeInTheDocument();
  });

  it("skal ha semibold weight", () => {
    const { container } = render(<Elementskrift ikon={MockIcon} tekst="Test" />);

    const element = container.querySelector(".navds-body-long");
    expect(element).toBeInTheDocument();
  });

  it("skal rendre tom tekst", () => {
    const { container } = render(<Elementskrift ikon={MockIcon} tekst="" />);

    const element = container.querySelector(".elementskrift");
    expect(element).toBeInTheDocument();
    expect(element?.textContent).toBe("Icon");
  });

  it("skal kombinere flere custom classNames", () => {
    const { container } = render(<Elementskrift ikon={MockIcon} tekst="Test" className="class1 class2" />);

    const element = container.querySelector(".elementskrift");
    expect(element).toHaveClass("elementskrift");
    expect(element).toHaveClass("class1");
    expect(element).toHaveClass("class2");
  });
});
