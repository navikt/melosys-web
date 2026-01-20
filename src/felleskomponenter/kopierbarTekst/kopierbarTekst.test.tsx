import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import KopierbarTekst from "./kopierbarTekst";

// Mock icons
vi.mock("../../resources/images", () => {
  const GreenCheckmark = ({ className }: { className?: string }) => (
    <span data-testid="green-checkmark" className={className}>
      Checkmark
    </span>
  );
  const Kopier = ({ className }: { className?: string }) => (
    <span data-testid="kopier-icon" className={className}>
      Kopier
    </span>
  );

  // Avoid unused warnings by using void operator
  void GreenCheckmark;
  void Kopier;

  return {
    GreenCheckmark,
    Kopier,
  };
});

describe("KopierbarTekst", () => {
  let clipboardWriteTextSpy: any;

  beforeEach(() => {
    // Mock clipboard API
    clipboardWriteTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: clipboardWriteTextSpy,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("skal rendre children tekst", () => {
    render(<KopierbarTekst>Test tekst</KopierbarTekst>);

    expect(screen.getByText("Test tekst")).toBeInTheDocument();
  });

  it("skal ha kopierbar-tekst className", () => {
    const { container } = render(<KopierbarTekst>Test</KopierbarTekst>);

    expect(container.querySelector(".kopierbar-tekst")).toBeInTheDocument();
  });

  it("skal legge til custom className", () => {
    const { container } = render(<KopierbarTekst className="custom-class">Test</KopierbarTekst>);

    const element = container.querySelector(".kopierbar-tekst");
    expect(element).toHaveClass("custom-class");
    expect(element).toHaveClass("kopierbar-tekst");
  });

  it("skal vise Kopier ikon som default", () => {
    render(<KopierbarTekst>Test</KopierbarTekst>);

    expect(screen.getByTestId("kopier-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("green-checkmark")).not.toBeInTheDocument();
  });

  it("skal vise GreenCheckmark etter kopiering", async () => {
    render(<KopierbarTekst>Test tekst</KopierbarTekst>);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("green-checkmark")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("kopier-icon")).not.toBeInTheDocument();
  });

  it("skal kopiere tekst til clipboard når knapp klikkes", async () => {
    render(<KopierbarTekst>Min tekst</KopierbarTekst>);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(clipboardWriteTextSpy).toHaveBeenCalledWith("Min tekst");
    });
  });

  it("skal vise hovertekst når mus går over", () => {
    const { container } = render(<KopierbarTekst hovertekst="Kopier til clipboard">Test</KopierbarTekst>);

    const wrapper = container.querySelector(".kopierbar-tekst");
    fireEvent.mouseOver(wrapper!);

    expect(screen.getByText("Kopier til clipboard")).toBeInTheDocument();
  });

  it("skal ikke vise hovertekst når hovertekst prop mangler", () => {
    const { container } = render(<KopierbarTekst>Test</KopierbarTekst>);

    const wrapper = container.querySelector(".kopierbar-tekst");
    fireEvent.mouseOver(wrapper!);

    expect(container.querySelector(".kopierbar-tekst__hovertekst")).not.toBeInTheDocument();
  });

  it("skal skjule hovertekst når mus forlater", () => {
    const { container } = render(<KopierbarTekst hovertekst="Kopier til clipboard">Test</KopierbarTekst>);

    const wrapper = container.querySelector(".kopierbar-tekst");
    fireEvent.mouseOver(wrapper!);
    expect(screen.getByText("Kopier til clipboard")).toBeInTheDocument();

    fireEvent.mouseLeave(wrapper!);
    expect(screen.queryByText("Kopier til clipboard")).not.toBeInTheDocument();
  });

  it("skal vise 'Kopiert' i hovertekst etter kopiering", async () => {
    const { container } = render(<KopierbarTekst hovertekst="Kopier til clipboard">Test</KopierbarTekst>);

    const wrapper = container.querySelector(".kopierbar-tekst");
    // Hover first to show hovertekst
    fireEvent.mouseOver(wrapper!);
    expect(screen.getByText("Kopier til clipboard")).toBeInTheDocument();

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Kopiert")).toBeInTheDocument();
    });
    expect(screen.queryByText("Kopier til clipboard")).not.toBeInTheDocument();
  });

  it("skal tilbakestille til Kopier ikon etter 1 sekund", async () => {
    vi.useFakeTimers();

    render(<KopierbarTekst>Test</KopierbarTekst>);

    const button = screen.getByRole("button");

    // Click and flush promises (clipboard.writeText is async)
    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve(); // Flush microtasks for clipboard promise
    });

    // Checkmark should be visible now
    expect(screen.getByTestId("green-checkmark")).toBeInTheDocument();

    // Advance time by 1 second
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Should be back to kopier icon
    expect(screen.getByTestId("kopier-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("green-checkmark")).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it("skal vise hovertekst ved focus", () => {
    const { container } = render(<KopierbarTekst hovertekst="Kopier til clipboard">Test</KopierbarTekst>);

    const wrapper = container.querySelector(".kopierbar-tekst");
    fireEvent.focus(wrapper!);

    expect(screen.getByText("Kopier til clipboard")).toBeInTheDocument();
  });

  it("skal skjule hovertekst ved blur", () => {
    const { container } = render(<KopierbarTekst hovertekst="Kopier til clipboard">Test</KopierbarTekst>);

    const wrapper = container.querySelector(".kopierbar-tekst");
    fireEvent.focus(wrapper!);
    expect(screen.getByText("Kopier til clipboard")).toBeInTheDocument();

    fireEvent.blur(wrapper!);
    expect(screen.queryByText("Kopier til clipboard")).not.toBeInTheDocument();
  });

  it("skal ha kopierbar-tekst__container className", () => {
    const { container } = render(<KopierbarTekst>Test</KopierbarTekst>);

    expect(container.querySelector(".kopierbar-tekst__container")).toBeInTheDocument();
  });

  it("skal legge til hover className ved mouseover", () => {
    const { container } = render(<KopierbarTekst>Test</KopierbarTekst>);

    const wrapper = container.querySelector(".kopierbar-tekst");
    fireEvent.mouseOver(wrapper!);

    expect(container.querySelector(".kopierbar-tekst__container__hover")).toBeInTheDocument();
  });

  it("skal fjerne hover className ved mouseleave", () => {
    const { container } = render(<KopierbarTekst>Test</KopierbarTekst>);

    const wrapper = container.querySelector(".kopierbar-tekst");
    fireEvent.mouseOver(wrapper!);
    expect(container.querySelector(".kopierbar-tekst__container__hover")).toBeInTheDocument();

    fireEvent.mouseLeave(wrapper!);
    expect(container.querySelector(".kopierbar-tekst__container__hover")).not.toBeInTheDocument();
  });

  it("skal håndtere clipboard feil gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    clipboardWriteTextSpy.mockRejectedValueOnce(new Error("Clipboard error"));

    render(<KopierbarTekst>Test</KopierbarTekst>);

    const button = screen.getByRole("button");

    // Click and wait for async error handling
    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve(); // Flush microtasks
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to copy text: ", expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it("skal ha riktig ikon className", () => {
    const { container } = render(<KopierbarTekst>Test</KopierbarTekst>);

    const icon = container.querySelector(".kopierbar-tekst__kopier-ikon");
    expect(icon).toBeInTheDocument();
  });

  it("skal håndtere flere klikk", async () => {
    render(<KopierbarTekst>Test</KopierbarTekst>);

    const button = screen.getByRole("button");

    // Click multiple times and flush async operations
    await act(async () => {
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      await Promise.resolve(); // Flush microtasks
    });

    expect(clipboardWriteTextSpy).toHaveBeenCalledTimes(3);
  });

  it("skal håndtere lang tekst", async () => {
    const langTekst = "Dette er en veldig lang tekst som skal kunne kopieres til clipboard";
    render(<KopierbarTekst>{langTekst}</KopierbarTekst>);

    const button = screen.getByRole("button");

    // Click and flush async operation
    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve(); // Flush microtasks
    });

    expect(clipboardWriteTextSpy).toHaveBeenCalledWith(langTekst);
  });

  it("skal rendre knapp med type button", () => {
    render(<KopierbarTekst>Test</KopierbarTekst>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });

  it("skal kunne ha forskjellig hovertekst", () => {
    const { container, rerender } = render(<KopierbarTekst hovertekst="Første tekst">Test</KopierbarTekst>);

    const wrapper = container.querySelector(".kopierbar-tekst");
    fireEvent.mouseOver(wrapper!);
    expect(screen.getByText("Første tekst")).toBeInTheDocument();

    rerender(<KopierbarTekst hovertekst="Andre tekst">Test</KopierbarTekst>);
    expect(screen.getByText("Andre tekst")).toBeInTheDocument();
    expect(screen.queryByText("Første tekst")).not.toBeInTheDocument();
  });
});
