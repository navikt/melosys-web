import MKV from "../../../../../melosyskodeverk";
import * as Hjelpetekster from "./hjelpetekster";
import * as Nav from "../../../../../navFrontend";

function BestemmelseHjelpetekst({ bestemmelse }: { bestemmelse?: string }) {
  if (!bestemmelse) return null;

  const { USA_ART5_2, USA_ART5_4, USA_ART5_5, USA_ART5_6 } =
    MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_us;
  const { UK_ART6_1, UK_ART6_5, UK_ART7_3, UK_ART8_2 } =
    MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_gb;
  const { CAN_ART6_2, CAN_ART7, CAN_ART9, CAN_ART10 } =
    MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_ca;
  const { AUS_ART9_2, AUS_ART9_3 } = MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_au;

  const hjelpeteksterTilBestemmelse = () => {
    switch (bestemmelse) {
      case UK_ART6_1:
        return Hjelpetekster.hjelpeteksterUkArt61;
      case UK_ART6_5:
        return Hjelpetekster.hjelpeteksterUkArt65;
      case UK_ART7_3:
        return Hjelpetekster.hjelpeteksterUkArt73;
      case UK_ART8_2:
        return Hjelpetekster.hjelpeteksterUkArt82;

      case USA_ART5_2:
        return Hjelpetekster.hjelpeteksterUsArt52;
      case USA_ART5_4:
        return Hjelpetekster.hjelpeteksterUsArt54;
      case USA_ART5_5:
        return Hjelpetekster.hjelpeteksterUsArt55;
      case USA_ART5_6:
        return Hjelpetekster.hjelpeteksterUsArt56;

      case CAN_ART6_2:
        return Hjelpetekster.hjelpeteksterCaArt62;
      case CAN_ART7:
        return Hjelpetekster.hjelpeteksterCaArt7;
      case CAN_ART9:
        return Hjelpetekster.hjelpeteksterCaArt9;
      case CAN_ART10:
        return Hjelpetekster.hjelpeteksterCaArt10;

      case AUS_ART9_2:
        return Hjelpetekster.hjelpeteksterAuArt92;
      case AUS_ART9_3:
        return Hjelpetekster.hjelpeteksterAuArt93;

      default:
        return [];
    }
  };

  const ikkeKravOmTidsbegrensning = [UK_ART6_5, UK_ART7_3, UK_ART8_2, USA_ART5_5, CAN_ART10, AUS_ART9_2].includes(
    bestemmelse,
  );
  const hjelpetekster = hjelpeteksterTilBestemmelse();

  if (hjelpetekster.length === 0) return null;

  return (
    <>
      <Nav.List title="Følgende vilkår må være oppfylt" size="small">
        {hjelpetekster.map((hjelpetekst) => (
          <Nav.List.Item key={hjelpetekst}>{hjelpetekst}</Nav.List.Item>
        ))}
      </Nav.List>
      {ikkeKravOmTidsbegrensning && <p>Det er ikke krav om at utsendingsperioden/arbeidsperioden er tidsbegrenset.</p>}
    </>
  );
}

export default BestemmelseHjelpetekst;
