import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import MKV from "../../../../melosyskodeverk";
import { VurderingVurderarbeidsland } from "./vurderingVurderarbeidsland";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";
import * as KV from "../../../../kodeverk/index";
import { STATUS } from "../../../../services/index";

describe("VurderingVurderarbeidsland", () => {
  let props = null;
  let initialReduxState = null;

  beforeEach(() => {
    props = {
      begrunnelser: [],
      bekreftOgFortsett: vi.fn(),
      tilbake: vi.fn(),
      tilstand: {
        harAvklaring: true,
        sokkelEllerSkipListe: [],
        installasjonArbeidslandListe: [],
        installasjonArbeidslandTypeListe: [],
        arbeidslandListe: [],
        arbeidUtforesIOppgittLandFakta: undefined,
        fjernetArbeidslandFakta: [],
        harIngenMaritimeArbeidEllerHjemmebaser: false,
        soknadslandFaktaListe: [],
        arbeidslandFaktaListe: [],
      },
      redigerbart: true,
      oppdaterData: vi.fn(),
      slettData: vi.fn(),
    };

    initialReduxState = {
      form: {
        [KV.Form.SOKNAD]: {
          values: {
            arbeidsstedOffshore: [],
            arbeidsstedSkip: [
              {
                enhetNavn: "Dunfjæder",
                fartsomradeKode: "INNENRIKS",
                flaggLandkode: "GB",
                innretningLandkode: "GB",
                territorialfarvann: "GB",
                foretakNavn: "SWECO NORGE AS",
                foretakOrgnr: "967032271",
              },
            ],
          },
        },
      },
      mottatteOpplysninger: {
        data: {
          luftfartBaser: [
            {
              hjemmebaseLand: MKV.Koder.landkoder.DE,
            },
          ],
          soeknadsland: {
            landkoder: MKV.Koder.landkoder.DE,
          },
        },
        status: STATUS.OK,
      },
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<VurderingVurderarbeidsland {...props} />, {
      preloadedState: initialReduxState,
    });
    expect(container).toMatchSnapshot();
  });
});
