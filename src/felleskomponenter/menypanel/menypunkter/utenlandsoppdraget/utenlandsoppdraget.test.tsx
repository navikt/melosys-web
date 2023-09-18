import { screen } from "@testing-library/react";
import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";
import { Utenlandsoppdraget } from "./utenlandsoppdraget";

describe("Utenlandsoppdraget", () => {
  const props = {
    redigerbart: true,
    visArbeidsforholdRolleEtiketter: true,
    lagreSoknadOgOppfriskSaksopplysninger: () => null,
  };
  const initialState = (sakstype: string) => ({
    fagsaker: {
      status: "",
      data: {
        sakstype: {
          kode: sakstype,
        },
      },
    },
    mottatteOpplysninger: {
      status: "",
      data: {
        data: {
          utenlandsoppdraget: {},
        },
      },
    },
    form: {
      [KV.Form.SOKNAD]: {
        values: {
          utenlandsoppdraget: {
            samletUtsendingsperiode: {},
          },
        },
      },
    },
  });

  it("viser ikke soknadslandvelger dersom sakstype er FTRL", () => {
    renderWithProviders(<Utenlandsoppdraget {...props} />, {
      // @ts-ignore
      preloadedState: initialState(MKV.Koder.sakstyper.FTRL),
    });

    expect(screen.queryAllByText("Land")).toHaveLength(0);
  });

  it("viser soknadslandvelger dersom sakstype ikke er FTRL", () => {
    renderWithProviders(<Utenlandsoppdraget {...props} />, {
      // @ts-ignore
      preloadedState: initialState(MKV.Koder.sakstyper.EU_EOS),
    });

    expect(screen.getByText("Land")).toBeInTheDocument();
  });
});
