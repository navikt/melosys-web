import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import MKV from "../../../../../melosyskodeverk";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import { TidligereGrunnlag } from "./tidligereGrunnlag";

describe("TidligereGrunnlag", () => {
  const createMockResponse = (overrides: Partial<AarsavregningResponse> = {}): AarsavregningResponse => ({
    aarsavregningID: 1,
    aar: 2023,
    sisteGjeldendeAvgiftspliktigperioder: [],
    tidligereTrygdeavgiftsGrunnlagsopplysninger: {
      trygdeavgiftsgrunnlag: {
        avgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "2023-01-01",
            tomDato: "2023-12-31",
            medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
            bestemmelse: "FTRL_2_7",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "FULL_DEKNING_FTRL",
            redigerbar: false,
          },
        ],
        skatteforholdsperioder: [
          {
            fomDato: "2023-01-01",
            tomDato: "2023-12-31",
            skatteplikttype: "SKATTEPLIKTIG",
          },
        ],
        inntektskperioder: [
          {
            type: "ARBEIDSINNTEKT",
            arbeidsgiversavgiftBetales: true,
            avgiftspliktigInntekt: 500000,
            fomDato: "2023-01-01",
            tomDato: "2023-12-31",
            erMaanedsbelop: false,
          },
        ],
      },
      avgift: {
        trygdeavgiftsperioder: [
          {
            fom: "2023-01-01",
            tom: "2023-12-31",
            inntektskildetype: "ARBEIDSINNTEKT",
            arbeidsgiversavgiftBetales: true,
            inntektPerMd: 41667,
            avgiftssats: 5.1,
            avgiftPerMd: 2125,
          },
        ],
        totalInntekt: 500000,
        totalAvgift: 25500,
      },
      tidligereTrygdeavgiftFraAvgiftssystemet: undefined,
      tidligereÅrsavregningManueltAvgiftBeloep: undefined,
    },
    ...overrides,
  });

  const createManuellBeregningResponse = (): AarsavregningResponse =>
    createMockResponse({
      tidligereTrygdeavgiftsGrunnlagsopplysninger: {
        trygdeavgiftsgrunnlag: {
          avgiftspliktigperioder: [
            {
              id: 1,
              fomDato: "2023-01-01",
              tomDato: "2023-12-31",
              medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
              bestemmelse: "FTRL_2_7",
              innvilgelsesResultat: "INNVILGET",
              trygdedekning: "FULL_DEKNING_FTRL",
              redigerbar: false,
            },
          ],
          skatteforholdsperioder: [],
          inntektskperioder: [],
        },
        avgift: {
          trygdeavgiftsperioder: [],
          totalInntekt: 0,
          totalAvgift: 0,
        },
        tidligereTrygdeavgiftFraAvgiftssystemet: undefined,
        tidligereÅrsavregningManueltAvgiftBeloep: 15000,
      },
    });

  it("beregning med grunnlag snapshot test", async () => {
    const user = userEvent.setup();
    const mockResponse = createMockResponse();

    const { container } = render(<TidligereGrunnlag aarsavregningResponse={mockResponse} />);

    await user.click(screen.getByRole("button"));

    expect(container).toMatchSnapshot();
  });

  it("manuell beregning snapshot test", async () => {
    const manuellResponse = createManuellBeregningResponse();

    const { container } = render(<TidligereGrunnlag aarsavregningResponse={manuellResponse} />);

    expect(container).toMatchSnapshot();
  });
});
