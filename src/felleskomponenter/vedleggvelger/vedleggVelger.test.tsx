import React, { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { shallow } from "enzyme";

import { Lenkeknapp } from "../ui";
import * as Nav from "../../navFrontend";

import VedleggVelger from "./vedleggVelger";
import VedleggVelgerModal from "./vedleggVelgerModal";

describe("VedleggVelger", () => {
  const mockedProps = mock<ComponentProps<typeof VedleggVelger>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("rendrer en knapp med tekst 'Legg til vedlegg'", () => {
    props.valgteVedlegg = [];
    const vedleggVelger = shallow(<VedleggVelger {...props} />);

    expect(vedleggVelger.find(Lenkeknapp).contains("Legg til vedlegg")).toBe(true);
  });
});

describe("VedleggVelgerModal", () => {
  const mockedProps = mock<ComponentProps<typeof VedleggVelgerModal>>();
  const props = instance(mockedProps);

  it("viser en Nav Modal", () => {
    const vedleggVelgerModal = shallow(<VedleggVelgerModal {...props} />);
    expect(vedleggVelgerModal.exists(Nav.Modal)).toBe(true);
  });
});
