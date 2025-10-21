import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Lenkeknapp from "./lenkeknapp";

// Mock icon component
const MockIcon = ({ className }: { className?: string }) => (
  <span data-testid="mock-icon" className={className}>
    Icon
  </span>
);

describe("Lenkeknapp", () => {
  it("skal rendre knapp med children", () => {
    const mockOnClick = vi.fn();
    render(<Lenkeknapp onClick={mockOnClick}>Klikk her</Lenkeknapp>);

    const button = screen.getByRole("button", { name: "Klikk her" });
    expect(button).toBeInTheDocument();
  });

  it("skal kalle onClick når knapp klikkes", () => {
    const mockOnClick = vi.fn();
    render(<Lenkeknapp onClick={mockOnClick}>Klikk her</Lenkeknapp>);

    const button = screen.getByRole("button", { name: "Klikk her" });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("skal rendre ikon når ikon prop er gitt", () => {
    const mockOnClick = vi.fn();
    render(
      <Lenkeknapp onClick={mockOnClick} ikon={MockIcon}>
        Klikk her
      </Lenkeknapp>,
    );

    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });

  it("skal ikke rendre ikon når ikon prop mangler", () => {
    const mockOnClick = vi.fn();
    render(<Lenkeknapp onClick={mockOnClick}>Klikk her</Lenkeknapp>);

    expect(screen.queryByTestId("mock-icon")).not.toBeInTheDocument();
  });

  it("skal gi ikon riktig className", () => {
    const mockOnClick = vi.fn();
    render(
      <Lenkeknapp onClick={mockOnClick} ikon={MockIcon}>
        Klikk her
      </Lenkeknapp>,
    );

    const icon = screen.getByTestId("mock-icon");
    expect(icon).toHaveClass("ikon");
  });

  it("skal legge til custom className", () => {
    const mockOnClick = vi.fn();
    render(
      <Lenkeknapp onClick={mockOnClick} className="custom-class">
        Klikk her
      </Lenkeknapp>,
    );

    const button = screen.getByRole("button", { name: "Klikk her" });
    expect(button).toHaveClass("custom-class");
  });

  it("skal være disabled når disabled prop er true", () => {
    const mockOnClick = vi.fn();
    render(
      <Lenkeknapp onClick={mockOnClick} disabled={true}>
        Klikk her
      </Lenkeknapp>,
    );

    const button = screen.getByRole("button", { name: "Klikk her" });
    expect(button).toBeDisabled();
  });

  it("skal ikke være disabled når disabled prop er false", () => {
    const mockOnClick = vi.fn();
    render(
      <Lenkeknapp onClick={mockOnClick} disabled={false}>
        Klikk her
      </Lenkeknapp>,
    );

    const button = screen.getByRole("button", { name: "Klikk her" });
    expect(button).not.toBeDisabled();
  });

  it("skal ikke være disabled som default", () => {
    const mockOnClick = vi.fn();
    render(<Lenkeknapp onClick={mockOnClick}>Klikk her</Lenkeknapp>);

    const button = screen.getByRole("button", { name: "Klikk her" });
    expect(button).not.toBeDisabled();
  });

  it("skal ikke kalle onClick når knapp er disabled", () => {
    const mockOnClick = vi.fn();
    render(
      <Lenkeknapp onClick={mockOnClick} disabled={true}>
        Klikk her
      </Lenkeknapp>,
    );

    const button = screen.getByRole("button", { name: "Klikk her" });
    fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("skal ha value attributt når value prop er gitt", () => {
    const mockOnClick = vi.fn();
    render(
      <Lenkeknapp onClick={mockOnClick} value="test-value">
        Klikk her
      </Lenkeknapp>,
    );

    const button = screen.getByRole("button", { name: "Klikk her" });
    expect(button).toHaveAttribute("value", "test-value");
  });

  it("skal ikke ha value attributt når value prop mangler", () => {
    const mockOnClick = vi.fn();
    render(<Lenkeknapp onClick={mockOnClick}>Klikk her</Lenkeknapp>);

    const button = screen.getByRole("button", { name: "Klikk her" });
    expect(button).not.toHaveAttribute("value");
  });

  it("skal rendre uten children", () => {
    const mockOnClick = vi.fn();
    render(<Lenkeknapp onClick={mockOnClick} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button.textContent).toBe("");
  });

  it("skal rendre komplekse children", () => {
    const mockOnClick = vi.fn();
    render(
      <Lenkeknapp onClick={mockOnClick}>
        <span>Del 1</span>
        <strong>Del 2</strong>
      </Lenkeknapp>,
    );

    expect(screen.getByText("Del 1")).toBeInTheDocument();
    expect(screen.getByText("Del 2")).toBeInTheDocument();
  });

  it("skal kalle onClick flere ganger ved flere klikk", () => {
    const mockOnClick = vi.fn();
    render(<Lenkeknapp onClick={mockOnClick}>Klikk her</Lenkeknapp>);

    const button = screen.getByRole("button", { name: "Klikk her" });
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(3);
  });

  it("skal rendre både ikon og children sammen", () => {
    const mockOnClick = vi.fn();
    render(
      <Lenkeknapp onClick={mockOnClick} ikon={MockIcon}>
        Klikk her
      </Lenkeknapp>,
    );

    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
    expect(screen.getByText("Klikk her")).toBeInTheDocument();
  });

  it("skal kunne endre onClick handler", () => {
    const mockOnClick1 = vi.fn();
    const mockOnClick2 = vi.fn();

    const { rerender } = render(<Lenkeknapp onClick={mockOnClick1}>Klikk her</Lenkeknapp>);

    const button = screen.getByRole("button", { name: "Klikk her" });
    fireEvent.click(button);
    expect(mockOnClick1).toHaveBeenCalledTimes(1);
    expect(mockOnClick2).not.toHaveBeenCalled();

    rerender(<Lenkeknapp onClick={mockOnClick2}>Klikk her</Lenkeknapp>);

    fireEvent.click(button);
    expect(mockOnClick1).toHaveBeenCalledTimes(1);
    expect(mockOnClick2).toHaveBeenCalledTimes(1);
  });
});
