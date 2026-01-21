import { ComponentProps } from "react";
import * as Ikoner from "../../resources/images";

import Undertittel from "./undertittel";
import { render, screen } from "@testing-library/react";
import { expect, vi } from "vitest";

// Mock _uuid with unique values
let uuidCounter = 0;
vi.mock("../../utils", () => ({
  _uuid: vi.fn(() => `test-uuid-${uuidCounter++}`),
}));

// Mock icon component
const MockIcon = ({ className, ...props }: any) => (
  <span data-testid="mock-icon" className={className} {...props}>
    Icon
  </span>
);

describe("undertittel", () => {
  let props: ComponentProps<typeof Undertittel>;

  beforeEach(() => {
    props = {} as ComponentProps<typeof Undertittel>;
  });

  it("snapshot test", () => {
    props.ikon = Ikoner.ParagraphTwoColumns;
    props.tekst = "Tekst";

    const { container } = render(<Undertittel {...props} />);
    expect(container).toMatchSnapshot();
  });

  it("skal rendre tekst", () => {
    render(<Undertittel tekst="Min tittel" />);

    expect(screen.getByText("Min tittel")).toBeInTheDocument();
  });

  it("skal ha undertittel className", () => {
    const { container } = render(<Undertittel tekst="Test" />);

    expect(container.querySelector(".undertittel")).toBeInTheDocument();
  });

  it("skal legge til custom className", () => {
    const { container } = render(<Undertittel tekst="Test" className="custom-class" />);

    const element = container.querySelector(".undertittel");
    expect(element).toHaveClass("custom-class");
    expect(element).toHaveClass("undertittel");
  });

  it("skal rendre ikon når ikon prop er gitt", () => {
    render(<Undertittel tekst="Test" ikon={MockIcon} />);

    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });

  it("skal ikke rendre ikon når ikon prop mangler", () => {
    render(<Undertittel tekst="Test" />);

    expect(screen.queryByTestId("mock-icon")).not.toBeInTheDocument();
  });

  it("skal gi ikon riktig className", () => {
    render(<Undertittel tekst="Test" ikon={MockIcon} />);

    const icon = screen.getByTestId("mock-icon");
    expect(icon).toHaveClass("undertittel__ikon");
  });

  it("skal rendre etterTekst når gitt", () => {
    render(<Undertittel tekst="Test" etterTekst={<span>Ekstra info</span>} />);

    expect(screen.getByText("Ekstra info")).toBeInTheDocument();
  });

  it("skal ikke rendre etterTekst når den mangler", () => {
    const { container } = render(<Undertittel tekst="Test" />);

    const spans = container.querySelectorAll("span");
    // Skal bare ha undertittel__tekst span
    expect(spans.length).toBeGreaterThanOrEqual(1);
  });

  it("skal ha understrek className når understrek er true", () => {
    const { container } = render(<Undertittel tekst="Test" understrek={true} />);

    expect(container.querySelector(".undertittel--understrek")).toBeInTheDocument();
  });

  it("skal ikke ha understrek className når understrek er false", () => {
    const { container } = render(<Undertittel tekst="Test" understrek={false} />);

    expect(container.querySelector(".undertittel--understrek")).not.toBeInTheDocument();
  });

  it("skal ikke ha understrek className som default", () => {
    const { container } = render(<Undertittel tekst="Test" />);

    expect(container.querySelector(".undertittel--understrek")).not.toBeInTheDocument();
  });

  it("skal bruke heading level 3", () => {
    render(<Undertittel tekst="Test" />);

    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toBeInTheDocument();
  });

  it("skal sette unikt id på heading", () => {
    render(<Undertittel tekst="Test" />);

    const heading = screen.getByRole("heading");
    expect(heading.getAttribute("id")).toMatch(/^test-uuid-\d+$/);
  });

  it("skal gi ikon default props", () => {
    render(<Undertittel tekst="Test tittel" ikon={MockIcon} />);

    const icon = screen.getByTestId("mock-icon");
    expect(icon).toHaveAttribute("role", "img");
    expect(icon).toHaveAttribute("focusable", "false");
    expect(icon.getAttribute("aria-labelledby")).toMatch(/^test-uuid-\d+$/);
  });

  it("skal sette ikon title med tekst", () => {
    render(<Undertittel tekst="Min tekst" ikon={MockIcon} />);

    const icon = screen.getByTestId("mock-icon");
    expect(icon).toHaveAttribute("title", "Min tekst - undefined");
  });

  it("skal sette ikon title med tekst og etterTekst", () => {
    render(<Undertittel tekst="Min tekst" etterTekst="Ekstra" ikon={MockIcon} />);

    const icon = screen.getByTestId("mock-icon");
    expect(icon).toHaveAttribute("title", "Min tekst - Ekstra");
  });

  it("skal kunne overstyre ikonProps", () => {
    const customProps = {
      "data-custom": "value",
      role: "presentation",
    };

    render(<Undertittel tekst="Test" ikon={MockIcon} ikonProps={customProps} />);

    const icon = screen.getByTestId("mock-icon");
    expect(icon).toHaveAttribute("data-custom", "value");
    // Custom props skal overstyre default props
    expect(icon).toHaveAttribute("role", "presentation");
  });

  it("skal rendre kompleks etterTekst", () => {
    render(
      <Undertittel
        tekst="Test"
        etterTekst={
          <div>
            <span>Del 1</span>
            <strong>Del 2</strong>
          </div>
        }
      />,
    );

    expect(screen.getByText("Del 1")).toBeInTheDocument();
    expect(screen.getByText("Del 2")).toBeInTheDocument();
  });

  it("skal rendre både ikon, tekst og etterTekst sammen", () => {
    render(<Undertittel tekst="Hovedtekst" etterTekst="Ekstra info" ikon={MockIcon} />);

    expect(screen.getByText("Hovedtekst")).toBeInTheDocument();
    expect(screen.getByText("Ekstra info")).toBeInTheDocument();
    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });

  it("skal ha undertittel__tekst className på tekst span", () => {
    const { container } = render(<Undertittel tekst="Test" />);

    const tekstSpan = container.querySelector(".undertittel__tekst");
    expect(tekstSpan).toBeInTheDocument();
    expect(tekstSpan?.textContent).toBe("Test");
  });
});
