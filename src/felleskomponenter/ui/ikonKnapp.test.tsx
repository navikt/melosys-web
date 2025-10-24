import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import IkonKnapp from "./ikonKnapp";

// Mock icon component
const MockIcon = ({ className }: { className?: string }) => (
  <span data-testid="mock-icon" className={className}>
    Icon
  </span>
);

describe("IkonKnapp", () => {
  it("skal rendre knapp", () => {
    const mockOnClick = vi.fn();
    render(<IkonKnapp ikon={MockIcon} onClick={mockOnClick} ariaLabel="Test knapp" />);

    const button = screen.getByRole("button", { name: "Test knapp" });
    expect(button).toBeInTheDocument();
  });

  it("skal rendre ikon", () => {
    const mockOnClick = vi.fn();
    render(<IkonKnapp ikon={MockIcon} onClick={mockOnClick} ariaLabel="Test knapp" />);

    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });

  it("skal kalle onClick når knapp klikkes", () => {
    const mockOnClick = vi.fn();
    render(<IkonKnapp ikon={MockIcon} onClick={mockOnClick} ariaLabel="Test knapp" />);

    const button = screen.getByRole("button", { name: "Test knapp" });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("skal ha riktig aria-label", () => {
    const mockOnClick = vi.fn();
    render(<IkonKnapp ikon={MockIcon} onClick={mockOnClick} ariaLabel="Slett element" />);

    const button = screen.getByRole("button", { name: "Slett element" });
    expect(button).toHaveAttribute("aria-label", "Slett element");
  });

  it("skal ha riktig title attributt", () => {
    const mockOnClick = vi.fn();
    render(<IkonKnapp ikon={MockIcon} onClick={mockOnClick} ariaLabel="Slett element" />);

    const button = screen.getByRole("button", { name: "Slett element" });
    expect(button).toHaveAttribute("title", "Slett element");
  });

  it("skal ha ikon-knapp className", () => {
    const mockOnClick = vi.fn();
    const { container } = render(<IkonKnapp ikon={MockIcon} onClick={mockOnClick} ariaLabel="Test" />);

    const button = container.querySelector(".ikon-knapp");
    expect(button).toBeInTheDocument();
  });

  it("skal legge til custom className", () => {
    const mockOnClick = vi.fn();
    const { container } = render(
      <IkonKnapp ikon={MockIcon} onClick={mockOnClick} ariaLabel="Test" className="custom-class" />,
    );

    const button = container.querySelector(".ikon-knapp");
    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("ikon-knapp");
  });

  it("skal være disabled når disabled prop er true", () => {
    const mockOnClick = vi.fn();
    render(<IkonKnapp ikon={MockIcon} onClick={mockOnClick} ariaLabel="Test" disabled={true} />);

    const button = screen.getByRole("button", { name: "Test" });
    expect(button).toBeDisabled();
  });

  it("skal ikke være disabled når disabled prop er false", () => {
    const mockOnClick = vi.fn();
    render(<IkonKnapp ikon={MockIcon} onClick={mockOnClick} ariaLabel="Test" disabled={false} />);

    const button = screen.getByRole("button", { name: "Test" });
    expect(button).not.toBeDisabled();
  });

  it("skal ikke være disabled som default", () => {
    const mockOnClick = vi.fn();
    render(<IkonKnapp ikon={MockIcon} onClick={mockOnClick} ariaLabel="Test" />);

    const button = screen.getByRole("button", { name: "Test" });
    expect(button).not.toBeDisabled();
  });

  it("skal ikke kalle onClick når knapp er disabled", () => {
    const mockOnClick = vi.fn();
    render(<IkonKnapp ikon={MockIcon} onClick={mockOnClick} ariaLabel="Test" disabled={true} />);

    const button = screen.getByRole("button", { name: "Test" });
    fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("skal gi ikon riktig className", () => {
    const mockOnClick = vi.fn();
    render(<IkonKnapp ikon={MockIcon} onClick={mockOnClick} ariaLabel="Test" />);

    const icon = screen.getByTestId("mock-icon");
    expect(icon).toHaveClass("ikon");
  });

  it("skal ha type button", () => {
    const mockOnClick = vi.fn();
    render(<IkonKnapp ikon={MockIcon} onClick={mockOnClick} ariaLabel="Test" />);

    const button = screen.getByRole("button", { name: "Test" });
    expect(button).toHaveAttribute("type", "button");
  });

  it("skal rendre ulike ikoner", () => {
    const AnotherIcon = ({ className }: { className?: string }) => (
      <span data-testid="another-icon" className={className}>
        Another
      </span>
    );

    const mockOnClick = vi.fn();
    const { rerender } = render(<IkonKnapp ikon={MockIcon} onClick={mockOnClick} ariaLabel="Test" />);

    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();

    rerender(<IkonKnapp ikon={AnotherIcon} onClick={mockOnClick} ariaLabel="Test" />);

    expect(screen.getByTestId("another-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-icon")).not.toBeInTheDocument();
  });

  it("skal kalle onClick flere ganger ved flere klikk", () => {
    const mockOnClick = vi.fn();
    render(<IkonKnapp ikon={MockIcon} onClick={mockOnClick} ariaLabel="Test" />);

    const button = screen.getByRole("button", { name: "Test" });
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(3);
  });
});
