import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import { VurderingArbeidsmonster } from "./vurderingArbeidsmonster";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

describe("VurderingArbeidsmonster", () => {
  let props = null;

  const initialReduxState = {
    form: {
      soknad: {
        initial: {
          soknadsland: {
            flereLandUkjentHvilke: true,
          },
        },
        values: {
          soknadsland: {
            flereLandUkjentHvilke: true,
          },
        },
      },
    },
  };

  beforeEach(() => {
    props = {
      begrunnelser: [],
      bekreftOgFortsett: vi.fn(),
      tilbake: vi.fn(),
      tilstand: {
        harAvklaring: true,
        marginaltArbeid: [],
        aktivitetINorge: {},
        aktivitetINorgeNodvendig: true,
        yrkesaktivitet: "",
        erArbeidstakerOgSelvstendigNaeringsdrivende: true,
        erOffentligTjenestemann: true,
        loennetArbeidAntallLandFakta: {},
        offentligArbeidAntallLandFakta: {},
        landMedVesentligArbeid: [],
        erNorgeValgt: true,
      },
      redigerbart: true,
      oppdaterData: vi.fn(),
      slettData: vi.fn(),
      arbeidsland: [],
      resetForm: vi.fn(),
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<VurderingArbeidsmonster {...props} />, {
      preloadedState: initialReduxState,
    });
    expect(container).toMatchSnapshot();
  });
});
