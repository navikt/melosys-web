import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CollapsiblePanel from "./collapsiblePanel";

// Mock icons
vi.mock("../../resources/images", () => ({
  ChevronLeft: () => <span data-testid="chevron-left">ChevronLeft</span>,
  ChevronRight: () => <span data-testid="chevron-right">ChevronRight</span>,
}));

describe("CollapsiblePanel", () => {
  it("skal rendre children", () => {
    render(
      <CollapsiblePanel direction="LEFT">
        <div>Test innhold</div>
      </CollapsiblePanel>,
    );

    expect(screen.getByText("Test innhold")).toBeInTheDocument();
  });

  it("skal være expanded som default", () => {
    const { container } = render(
      <CollapsiblePanel direction="LEFT">
        <div>Test</div>
      </CollapsiblePanel>,
    );

    expect(container.querySelector(".collapsible-panel.expanded")).toBeInTheDocument();
  });

  it("skal kunne være collapsed ved oppstart", () => {
    const { container } = render(
      <CollapsiblePanel direction="LEFT" defaultExpanded={false}>
        <div>Test</div>
      </CollapsiblePanel>,
    );

    expect(container.querySelector(".collapsible-panel.collapsed")).toBeInTheDocument();
    expect(container.querySelector(".collapsible-panel.expanded")).not.toBeInTheDocument();
  });

  it("skal vise ChevronLeft når expanded og direction er LEFT", () => {
    render(
      <CollapsiblePanel direction="LEFT" defaultExpanded={true}>
        <div>Test</div>
      </CollapsiblePanel>,
    );

    expect(screen.getByTestId("chevron-left")).toBeInTheDocument();
    expect(screen.queryByTestId("chevron-right")).not.toBeInTheDocument();
  });

  it("skal vise ChevronRight når collapsed og direction er LEFT", () => {
    render(
      <CollapsiblePanel direction="LEFT" defaultExpanded={false}>
        <div>Test</div>
      </CollapsiblePanel>,
    );

    expect(screen.getByTestId("chevron-right")).toBeInTheDocument();
    expect(screen.queryByTestId("chevron-left")).not.toBeInTheDocument();
  });

  it("skal vise ChevronRight når expanded og direction er RIGHT", () => {
    render(
      <CollapsiblePanel direction="RIGHT" defaultExpanded={true}>
        <div>Test</div>
      </CollapsiblePanel>,
    );

    expect(screen.getByTestId("chevron-right")).toBeInTheDocument();
    expect(screen.queryByTestId("chevron-left")).not.toBeInTheDocument();
  });

  it("skal vise ChevronLeft når collapsed og direction er RIGHT", () => {
    render(
      <CollapsiblePanel direction="RIGHT" defaultExpanded={false}>
        <div>Test</div>
      </CollapsiblePanel>,
    );

    expect(screen.getByTestId("chevron-left")).toBeInTheDocument();
    expect(screen.queryByTestId("chevron-right")).not.toBeInTheDocument();
  });

  it("skal toggle expanded når knapp klikkes", () => {
    const { container } = render(
      <CollapsiblePanel direction="LEFT">
        <div>Test</div>
      </CollapsiblePanel>,
    );

    expect(container.querySelector(".collapsible-panel.expanded")).toBeInTheDocument();

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(container.querySelector(".collapsible-panel.collapsed")).toBeInTheDocument();
    expect(container.querySelector(".collapsible-panel.expanded")).not.toBeInTheDocument();
  });

  it("skal kalle onToggle callback når toggle klikkes", () => {
    const mockOnToggle = vi.fn();

    render(
      <CollapsiblePanel direction="LEFT" onToggle={mockOnToggle}>
        <div>Test</div>
      </CollapsiblePanel>,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnToggle).toHaveBeenCalledWith(false);
  });

  it("skal sende riktig expanded state til onToggle", () => {
    const mockOnToggle = vi.fn();

    render(
      <CollapsiblePanel direction="LEFT" defaultExpanded={false} onToggle={mockOnToggle}>
        <div>Test</div>
      </CollapsiblePanel>,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnToggle).toHaveBeenCalledWith(true);
  });

  it("skal ha riktig title når collapsed", () => {
    render(
      <CollapsiblePanel direction="LEFT" defaultExpanded={false}>
        <div>Test</div>
      </CollapsiblePanel>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Vis panel");
  });

  it("skal ha riktig title når expanded", () => {
    render(
      <CollapsiblePanel direction="LEFT" defaultExpanded={true}>
        <div>Test</div>
      </CollapsiblePanel>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Skjul panel");
  });

  it("skal oppdatere title når toggle klikkes", () => {
    render(
      <CollapsiblePanel direction="LEFT">
        <div>Test</div>
      </CollapsiblePanel>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Skjul panel");

    fireEvent.click(button);
    expect(button).toHaveAttribute("title", "Vis panel");
  });

  it("skal ha chevron-toggle-button className på knapp", () => {
    render(
      <CollapsiblePanel direction="LEFT">
        <div>Test</div>
      </CollapsiblePanel>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("chevron-toggle-button");
  });

  it("skal ha type button", () => {
    render(
      <CollapsiblePanel direction="LEFT">
        <div>Test</div>
      </CollapsiblePanel>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });

  it("skal legge til custom className", () => {
    const { container } = render(
      <CollapsiblePanel direction="LEFT" className="custom-class">
        <div>Test</div>
      </CollapsiblePanel>,
    );

    const panel = container.querySelector(".collapsible-panel");
    expect(panel).toHaveClass("custom-class");
  });

  it("skal ha collapsible-panel__content className på innhold", () => {
    const { container } = render(
      <CollapsiblePanel direction="LEFT">
        <div>Test</div>
      </CollapsiblePanel>,
    );

    expect(container.querySelector(".collapsible-panel__content")).toBeInTheDocument();
  });

  it("skal ha collapsible-panel__toggle className på toggle wrapper", () => {
    const { container } = render(
      <CollapsiblePanel direction="LEFT">
        <div>Test</div>
      </CollapsiblePanel>,
    );

    expect(container.querySelector(".collapsible-panel__toggle")).toBeInTheDocument();
  });

  it("skal ha direction left className når direction er LEFT", () => {
    const { container } = render(
      <CollapsiblePanel direction="LEFT">
        <div>Test</div>
      </CollapsiblePanel>,
    );

    expect(container.querySelector(".collapsible-panel--direction-left")).toBeInTheDocument();
  });

  it("skal ha direction right className når direction er RIGHT", () => {
    const { container } = render(
      <CollapsiblePanel direction="RIGHT">
        <div>Test</div>
      </CollapsiblePanel>,
    );

    expect(container.querySelector(".collapsible-panel--direction-right")).toBeInTheDocument();
  });

  it("skal kunne toggle flere ganger", () => {
    const { container } = render(
      <CollapsiblePanel direction="LEFT">
        <div>Test</div>
      </CollapsiblePanel>,
    );

    const button = screen.getByRole("button");

    expect(container.querySelector(".expanded")).toBeInTheDocument();

    fireEvent.click(button);
    expect(container.querySelector(".collapsed")).toBeInTheDocument();

    fireEvent.click(button);
    expect(container.querySelector(".expanded")).toBeInTheDocument();

    fireEvent.click(button);
    expect(container.querySelector(".collapsed")).toBeInTheDocument();
  });

  it("skal kalle onToggle hver gang toggle klikkes", () => {
    const mockOnToggle = vi.fn();

    render(
      <CollapsiblePanel direction="LEFT" onToggle={mockOnToggle}>
        <div>Test</div>
      </CollapsiblePanel>,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockOnToggle).toHaveBeenCalledTimes(3);
    expect(mockOnToggle).toHaveBeenNthCalledWith(1, false);
    expect(mockOnToggle).toHaveBeenNthCalledWith(2, true);
    expect(mockOnToggle).toHaveBeenNthCalledWith(3, false);
  });

  it("skal rendre kompleks children", () => {
    render(
      <CollapsiblePanel direction="LEFT">
        <div>
          <h1>Heading</h1>
          <p>Paragraph</p>
          <span>Span</span>
        </div>
      </CollapsiblePanel>,
    );

    expect(screen.getByText("Heading")).toBeInTheDocument();
    expect(screen.getByText("Paragraph")).toBeInTheDocument();
    expect(screen.getByText("Span")).toBeInTheDocument();
  });

  it("skal ikke kalle onToggle når den ikke er gitt", () => {
    const { container } = render(
      <CollapsiblePanel direction="LEFT">
        <div>Test</div>
      </CollapsiblePanel>,
    );

    const button = screen.getByRole("button");

    // Skal ikke kaste feil når onToggle ikke er satt
    expect(() => fireEvent.click(button)).not.toThrow();
    expect(container.querySelector(".collapsed")).toBeInTheDocument();
  });

  it("skal endre ikon når toggle klikkes med LEFT direction", () => {
    render(
      <CollapsiblePanel direction="LEFT">
        <div>Test</div>
      </CollapsiblePanel>,
    );

    expect(screen.getByTestId("chevron-left")).toBeInTheDocument();

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByTestId("chevron-right")).toBeInTheDocument();
    expect(screen.queryByTestId("chevron-left")).not.toBeInTheDocument();
  });

  it("skal endre ikon når toggle klikkes med RIGHT direction", () => {
    render(
      <CollapsiblePanel direction="RIGHT">
        <div>Test</div>
      </CollapsiblePanel>,
    );

    expect(screen.getByTestId("chevron-right")).toBeInTheDocument();

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByTestId("chevron-left")).toBeInTheDocument();
    expect(screen.queryByTestId("chevron-right")).not.toBeInTheDocument();
  });
});
