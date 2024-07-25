import EnkeltDato from "../../../../../felleskomponenter/enkeltDato";
import * as Nav from "../../../../../navFrontend";
import { MKVUtils } from "../../../../../melosyskodeverk";
import { useSelector } from "react-redux";
import { lovvalgsperioderSelectors } from "../../../../../ducks/lovvalgsperioder";

interface DatoOgBestemmelseProps {
  fomDato: string | undefined | null;
  tomDato: string | undefined | null;
}

const DatoOgBestemmelse = ({ fomDato, tomDato }: DatoOgBestemmelseProps) => {
  const bestemmelse = useSelector(lovvalgsperioderSelectors.LovvalgBestemmelseSelector);
  const lovvalgsbestemmelseKT = MKVUtils.lovvalgsbestemmelseTilObjekt(bestemmelse);

  return (
    <>
      <Nav.Row className="lovvalgsperiode__row">
        <Nav.Column xs="5">
          <Nav.Typo.Element>Lovvalgsperiode</Nav.Typo.Element>
        </Nav.Column>
        <Nav.Column xs="7">
          <Nav.Typo.Element>Lovvalgsbestemmelse</Nav.Typo.Element>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="5">
          <EnkeltDato dato={fomDato} />
          &nbsp;-&nbsp;
          <EnkeltDato dato={tomDato} />
        </Nav.Column>
        <Nav.Column xs="7">
          <Nav.Typo.Normaltekst>{lovvalgsbestemmelseKT?.term}</Nav.Typo.Normaltekst>
        </Nav.Column>
      </Nav.Row>
    </>
  );
};

export default DatoOgBestemmelse;
