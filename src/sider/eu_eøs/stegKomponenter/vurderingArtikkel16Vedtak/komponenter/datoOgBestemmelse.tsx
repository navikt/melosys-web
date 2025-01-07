import EnkeltDato from "../../../../../felleskomponenter/enkeltDato";
import * as Nav from "../../../../../navFrontend";
import { MKVUtils } from "../../../../../melosyskodeverk";
import { useSelector } from "react-redux";
import { lovvalgsperioderSelectors } from "../../../../../ducks/lovvalgsperioder";

interface DatoOgBestemmelseProps {
  fomDato: string | undefined | null;
  tomDato: string | undefined | null;
}

function DatoOgBestemmelse({ fomDato, tomDato }: DatoOgBestemmelseProps) {
  const bestemmelse = useSelector(lovvalgsperioderSelectors.LovvalgBestemmelseSelector);
  const lovvalgsbestemmelseKT = MKVUtils.lovvalgsbestemmelseTilObjekt(bestemmelse);

  return (
    <>
      <Nav.Row className="lovvalgsperiode__row">
        <Nav.Column xs="5">
          <Nav.BodyLong weight="semibold" size="small">
            Lovvalgsperiode
          </Nav.BodyLong>
        </Nav.Column>
        <Nav.Column xs="7">
          <Nav.BodyLong weight="semibold" size="small">
            Lovvalgsbestemmelse
          </Nav.BodyLong>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="5">
          <EnkeltDato dato={fomDato} />
          &nbsp;-&nbsp;
          <EnkeltDato dato={tomDato} />
        </Nav.Column>
        <Nav.Column xs="7">
          <Nav.BodyLong size="small">{lovvalgsbestemmelseKT?.term}</Nav.BodyLong>
        </Nav.Column>
      </Nav.Row>
    </>
  );
}

export default DatoOgBestemmelse;
