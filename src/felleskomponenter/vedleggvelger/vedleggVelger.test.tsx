import { ComponentProps } from "react";
import userEvent from "@testing-library/user-event";

import VedleggVelger from "./vedleggVelger";
import VedleggVelgerModal from "./vedleggVelgerModal";
import { render, screen } from "@testing-library/react";

// Mock the table component to avoid HTML structure issues in tests
vi.mock("./vedleggVelgerTable", () => ({
  default: () => <div data-testid="mocked-vedlegg-velger-table">Mocked VedleggVelgerTable</div>,
}));

describe("VedleggVelger", () => {
  let props: ComponentProps<typeof VedleggVelger>;

  beforeEach(() => {
    props = {} as ComponentProps<typeof VedleggVelger>;
  });

  it("rendrer en knapp med tekst 'Legg til vedlegg'", () => {
    props.valgteVedlegg = {
      saksvedlegg: [],
      standardvedlegg: null,
    };
    render(<VedleggVelger {...props} />);
    expect(screen.getByRole("button", { name: /legg til vedlegg/i })).toBeInTheDocument();
  });

  it("kaller onOpen når 'Legg til vedlegg' klikkes", async () => {
    const onOpen = vi.fn();
    props.valgteVedlegg = {
      saksvedlegg: [],
      standardvedlegg: null,
    };
    props.redigerbart = true;
    props.onOpen = onOpen;

    render(<VedleggVelger {...props} />);

    await userEvent.click(screen.getByRole("button", { name: /legg til vedlegg/i }));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("kaller ikke onOpen når modalen lukkes", async () => {
    const onOpen = vi.fn();
    props.valgteVedlegg = {
      saksvedlegg: [],
      standardvedlegg: null,
    };
    props.redigerbart = true;
    props.onOpen = onOpen;
    props.dokumenter = [];
    props.standardvedlegg = [];

    render(<VedleggVelger {...props} />);

    // Åpne modalen
    await userEvent.click(screen.getByRole("button", { name: /legg til vedlegg/i }));
    expect(onOpen).toHaveBeenCalledTimes(1);

    // Lukk modalen via Lukk-knappen
    onOpen.mockClear();
    await userEvent.click(screen.getByRole("button", { name: /lukk/i }));

    expect(onOpen).not.toHaveBeenCalled();
  });
});

describe("VedleggVelgerModal", () => {
  const props: ComponentProps<typeof VedleggVelgerModal> = {
    valgteVedlegg: {
      saksvedlegg: [],
      standardvedlegg: null,
    },
    alleSaksvedlegg: [],
  } as unknown as ComponentProps<typeof VedleggVelgerModal>;

  it("viser en Nav Modal", () => {
    render(<VedleggVelgerModal {...props} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
