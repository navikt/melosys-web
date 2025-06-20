import { ComponentProps } from "react";

import VedleggVelger from "./vedleggVelger";
import VedleggVelgerModal from "./vedleggVelgerModal";
import { render, screen } from "@testing-library/react";

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
