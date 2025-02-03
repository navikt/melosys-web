import { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";

import VedleggVelger from "./vedleggVelger";
import VedleggVelgerModal from "./vedleggVelgerModal";
import { render, screen } from "@testing-library/react";

describe("VedleggVelger", () => {
  const mockedProps = mock<ComponentProps<typeof VedleggVelger>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
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
  const mockedProps = mock<ComponentProps<typeof VedleggVelgerModal>>();
  const props = instance(mockedProps);
  props.valgteVedlegg = {
    saksvedlegg: [],
    standardvedlegg: null,
  };
  props.alleSaksvedlegg = [];

  it("viser en Nav Modal", () => {
    render(<VedleggVelgerModal {...props} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
