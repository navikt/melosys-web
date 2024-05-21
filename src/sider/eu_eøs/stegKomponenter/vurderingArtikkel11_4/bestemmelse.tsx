import { KTObject } from "@navikt/melosys-kodeverk";
import * as Nav from "../../../../navFrontend";
import MKV from "../../../../melosyskodeverk";
import { ArtikkelValg } from "./vurderingArtikkel11_4";
import * as KV from "../../../../kodeverk";

const { KONV_EFTA_STORBRITANNIA_ART13_3A, KONV_EFTA_STORBRITANNIA_ART13_4_2 } =
  MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia;
const { KONV_EFTA_STORBRITANNIA_ART13_4_1 } =
  MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_konv_efta_storbritannia;
const { FO_883_2004_ART11_4_2, FO_883_2004_ART11_3A } = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004;
const { FO_883_2004_ART11_4_1 } = MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004;

export const tilleggsbestemmelseFraLovvalgsbestemmelse = (lovvalgsbestemmelse: string): string | undefined => {
  switch (lovvalgsbestemmelse) {
    case FO_883_2004_ART11_3A:
      return FO_883_2004_ART11_4_1;
    case KONV_EFTA_STORBRITANNIA_ART13_3A:
      return KONV_EFTA_STORBRITANNIA_ART13_4_1;
    default:
      return undefined;
  }
};

export const kodeTilObjektKonvGB = (bestemmelseKode: string): KTObject =>
  KV.kodeTilObjekt(bestemmelseKode, MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia);
export const kodeTilObjektEØS = (bestemmelseKode: string): KTObject =>
  KV.kodeTilObjekt(bestemmelseKode, MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004);

interface BestemmelseProps {
  bestemmelse?: string;
  handleEndreBestemmelse: (nyBestemmelse: string) => void;
  artikkelValg: ArtikkelValg | undefined;
  redigerbart: boolean;
  visStorbritanniaKonvensjon: boolean;
}
const Bestemmelse = ({
  bestemmelse,
  handleEndreBestemmelse,
  artikkelValg,
  redigerbart,
  visStorbritanniaKonvensjon,
}: BestemmelseProps) => {
  const hentBestemmelser = (): KTObject[] => {
    if (artikkelValg === ArtikkelValg.ART11_4_1) {
      return visStorbritanniaKonvensjon
        ? [kodeTilObjektKonvGB(KONV_EFTA_STORBRITANNIA_ART13_3A), kodeTilObjektEØS(FO_883_2004_ART11_3A)]
        : [kodeTilObjektEØS(FO_883_2004_ART11_3A)];
    }
    if (artikkelValg === ArtikkelValg.ART11_4_2) {
      return visStorbritanniaKonvensjon
        ? [kodeTilObjektKonvGB(KONV_EFTA_STORBRITANNIA_ART13_4_2), kodeTilObjektEØS(FO_883_2004_ART11_4_2)]
        : [kodeTilObjektEØS(FO_883_2004_ART11_4_2)];
    }
    return [];
  };

  return (
    <Nav.Select
      label="Velg bestemmelse"
      value={bestemmelse}
      onChange={(event) => handleEndreBestemmelse(event.target.value)}
      disabled={!redigerbart || !visStorbritanniaKonvensjon}
    >
      <option disabled={!!bestemmelse} key="" value="" label="Velg..." />
      {hentBestemmelser().map((ktobject) => (
        <option key={ktobject.kode} value={ktobject.kode} label={ktobject.term ?? ""} />
      ))}
    </Nav.Select>
  );
};

export default Bestemmelse;
