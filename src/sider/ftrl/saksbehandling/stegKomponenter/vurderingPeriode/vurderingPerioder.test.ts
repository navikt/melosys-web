import MKV from "../../../../../melosyskodeverk";
import { hentInformasjonstekst } from "./vurderingPerioder";

const { NY_VURDERING, MANGLENDE_INNBETALING_TRYGDEAVGIFT } = MKV.Koder.behandlinger.behandlingstyper;

describe("hentInformasjonstekst", () => {
  it("returnerer pliktig-tekst når medlemskapsTypeErPliktig er true, uavhengig av andre parametere", () => {
    expect(hentInformasjonstekst(MANGLENDE_INNBETALING_TRYGDEAVGIFT, true, true)).toMatch(/pliktig medlemskap/);
  });

  it("returnerer ny-vurdering-tekst for NY_VURDERING", () => {
    expect(hentInformasjonstekst(NY_VURDERING, false, false)).toMatch(/ny vurdering av frivillig medlemskap/);
  });

  it("returnerer delvis-opphør-tekst når erDelvisOpphørValgt er true", () => {
    expect(hentInformasjonstekst(MANGLENDE_INNBETALING_TRYGDEAVGIFT, false, true)).toBe(
      'Forkort perioden med resultat "Innvilget", og legg deretter til resterende periode med resultat "opphørt". Opphørsdatoen for medlemskapet blir startdatoen for den opphørte perioden.',
    );
  });

  it("returnerer manglende-innbetaling-tekst når erDelvisOpphørValgt er false", () => {
    expect(hentInformasjonstekst(MANGLENDE_INNBETALING_TRYGDEAVGIFT, false, false)).toMatch(
      /Ved manglende innbetaling vises tidligere innvilgede medlemskapsperioder/,
    );
  });

  it("returnerer generisk tekst for øvrige behandlingstyper", () => {
    expect(hentInformasjonstekst("ANNEN_TYPE", false, false)).toMatch(/Ved frivillig medlemskap/);
  });
});
