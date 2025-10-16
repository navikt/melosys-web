import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ChevronKnapp from "./chevronKnapp";

// Mock icons
vi.mock("../../resources/images", () => ({
  ChevronUp: () => <span data-testid="chevron-up">ChevronUp</span>,
  ChevronDown: () => <span data-testid="chevron-down">ChevronDown</span>,
}));

describe("ChevronKnapp", () => {
  it("skal rendre knapp med label", () => {
    const mockOnChange = vi.fn();
    render(<ChevronKnapp expanded={false} onChange={mockOnChange} label="Test label" />);

    expect(screen.getByRole("button", { name: /Test label/ })).toBeInTheDocument();
  });

  it("skal ha chevronKnapp className", () => {
    const mockOnChange = vi.fn();
    const { container } = render(<ChevronKnapp expanded={false} onChange={mockOnChange} label="Test" />);

    expect(container.querySelector(".chevronKnapp")).toBeInTheDocument();
  });

  it("skal vise ChevronDown når expanded er false", () => {
    const mockOnChange = vi.fn();
    render(<ChevronKnapp expanded={false} onChange={mockOnChange} label="Test" />);

    expect(screen.getByTestId("chevron-down")).toBeInTheDocument();
    expect(screen.queryByTestId("chevron-up")).not.toBeInTheDocument();
  });

  it("skal vise ChevronUp når expanded er true", () => {
    const mockOnChange = vi.fn();
    render(<ChevronKnapp expanded={true} onChange={mockOnChange} label="Test" />);

    expect(screen.getByTestId("chevron-up")).toBeInTheDocument();
    expect(screen.queryByTestId("chevron-down")).not.toBeInTheDocument();
  });

  it("skal kalle onChange når knapp klikkes", () => {
    const mockOnChange = vi.fn();
    render(<ChevronKnapp expanded={false} onChange={mockOnChange} label="Test" />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it("skal ha type button", () => {
    const mockOnChange = vi.fn();
    render(<ChevronKnapp expanded={false} onChange={mockOnChange} label="Test" />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });

  it("skal kunne klikkes flere ganger", () => {
    const mockOnChange = vi.fn();
    render(<ChevronKnapp expanded={false} onChange={mockOnChange} label="Test" />);

    const button = screen.getByRole("button");
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockOnChange).toHaveBeenCalledTimes(3);
  });

  it("skal rendre med ulike labels", () => {
    const mockOnChange = vi.fn();
    const { rerender } = render(<ChevronKnapp expanded={false} onChange={mockOnChange} label="Første label" />);

    expect(screen.getByText("Første label")).toBeInTheDocument();

    rerender(<ChevronKnapp expanded={false} onChange={mockOnChange} label="Andre label" />);

    expect(screen.getByText("Andre label")).toBeInTheDocument();
    expect(screen.queryByText("Første label")).not.toBeInTheDocument();
  });

  it("skal endre ikon når expanded endres", () => {
    const mockOnChange = vi.fn();
    const { rerender } = render(<ChevronKnapp expanded={false} onChange={mockOnChange} label="Test" />);

    expect(screen.getByTestId("chevron-down")).toBeInTheDocument();

    rerender(<ChevronKnapp expanded={true} onChange={mockOnChange} label="Test" />);

    expect(screen.getByTestId("chevron-up")).toBeInTheDocument();
    expect(screen.queryByTestId("chevron-down")).not.toBeInTheDocument();
  });

  it("skal kunne ha forskjellige onChange handlers", () => {
    const mockOnChange1 = vi.fn();
    const mockOnChange2 = vi.fn();

    const { rerender } = render(<ChevronKnapp expanded={false} onChange={mockOnChange1} label="Test" />);

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockOnChange1).toHaveBeenCalledTimes(1);
    expect(mockOnChange2).not.toHaveBeenCalled();

    rerender(<ChevronKnapp expanded={false} onChange={mockOnChange2} label="Test" />);

    fireEvent.click(button);
    expect(mockOnChange1).toHaveBeenCalledTimes(1);
    expect(mockOnChange2).toHaveBeenCalledTimes(1);
  });

  it("skal rendre label og ikon sammen", () => {
    const mockOnChange = vi.fn();
    render(<ChevronKnapp expanded={false} onChange={mockOnChange} label="Klikk her" />);

    expect(screen.getByText("Klikk her")).toBeInTheDocument();
    expect(screen.getByTestId("chevron-down")).toBeInTheDocument();
  });

  it("skal håndtere lang label tekst", () => {
    const mockOnChange = vi.fn();
    const langLabel = "Dette er en veldig lang label tekst som skal vises i knappen";

    render(<ChevronKnapp expanded={false} onChange={mockOnChange} label={langLabel} />);

    expect(screen.getByText(langLabel)).toBeInTheDocument();
  });

  it("skal håndtere tom label", () => {
    const mockOnChange = vi.fn();
    render(<ChevronKnapp expanded={false} onChange={mockOnChange} label="" />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });
});
