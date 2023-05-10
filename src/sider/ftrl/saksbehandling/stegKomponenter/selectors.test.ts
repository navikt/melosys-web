import each from "jest-each";

import { LonnsforholdErNorgeEllerDelt, LonnsforholdErUtlandetEllerDelt } from "./selectors";

import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";

const { LØNN_FRA_NORGE, LØNN_FRA_UTLANDET, DELT_LØNN } = MKV.Koder.loenn_forhold;

describe("FTRL stegkomponenter selectors", () => {
  describe("LonnsforholdErNorgeEllerDelt", () => {
    each([
      [true, LØNN_FRA_NORGE],
      [true, DELT_LØNN],
      [false, LØNN_FRA_UTLANDET],
    ]).it("returnerer %s for %s", (forventetResultat, lonnsforholdKode) => {
      const state = {
        form: {
          [KV.Form.TRYGDEAVGIFT]: {
            values: {
              avgiftsgrunnlag: {
                lønnsforhold: lonnsforholdKode,
              },
            },
          },
        },
      };
      // @ts-ignore
      expect(LonnsforholdErNorgeEllerDelt(state)).toBe(forventetResultat);
    });
  });

  describe("LonnsforholdErUtlandetEllerDelt", () => {
    each([
      [false, LØNN_FRA_NORGE],
      [true, DELT_LØNN],
      [true, LØNN_FRA_UTLANDET],
    ]).it("returnerer %s for %s", (forventetResultat, lonnsforholdKode) => {
      const state = {
        form: {
          [KV.Form.TRYGDEAVGIFT]: {
            values: {
              avgiftsgrunnlag: {
                lønnsforhold: lonnsforholdKode,
              },
            },
          },
        },
      };
      // @ts-ignore
      expect(LonnsforholdErUtlandetEllerDelt(state)).toBe(forventetResultat);
    });
  });
});
