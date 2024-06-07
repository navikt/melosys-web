import EnkeltDato from "../../../../../felleskomponenter/enkeltDato";
import * as Nav from "../../../../../navFrontend";
import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";
import { useSelector } from "react-redux";
import { lovvalgsperioderSelectors } from "../../../../../ducks/lovvalgsperioder";

// TODO: Dra inn fra MKVUtils når vedtak-pr er merget.
const lovvalgsbestemmelseTilObjekt = (bestemmelseKode: string) => {
  return (
    KV.kodeTilObjekt(bestemmelseKode, MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004) ??
    KV.kodeTilObjekt(bestemmelseKode, MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia)
  );
};

interface DatoOgBestemmelseProps {
  fomDato: string | undefined | null;
  tomDato: string | undefined | null;
}

const DatoOgBestemmelse = ({ fomDato, tomDato }: DatoOgBestemmelseProps) => {
  const bestemmelse = useSelector(lovvalgsperioderSelectors.LovvalgBestemmelseSelector);
  const lovvalgsbestemmelseKT = lovvalgsbestemmelseTilObjekt(bestemmelse);

  return (
    <>
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Typo.Element>Lovvalgsperiode</Nav.Typo.Element>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="2">
          <Nav.Typo.Element>Fra</Nav.Typo.Element>
          <EnkeltDato dato={fomDato} />
        </Nav.Column>
        <Nav.Column xs="2">
          <Nav.Typo.Element>Til</Nav.Typo.Element>
          <EnkeltDato dato={tomDato} />
        </Nav.Column>
        <Nav.Column xs="8">
          <Nav.Typo.Element>Lovvalgsbestemmelse</Nav.Typo.Element>
          {lovvalgsbestemmelseKT?.term}
        </Nav.Column>
      </Nav.Row>
    </>
  );
};

export default DatoOgBestemmelse;
