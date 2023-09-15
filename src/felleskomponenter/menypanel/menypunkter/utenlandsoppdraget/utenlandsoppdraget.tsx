import { useDispatch, useSelector } from "react-redux";

import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";

import { mottatteOpplysningerOperations } from "../../../../ducks/mottatteOpplysninger";
import { fagsakSelectors } from "../../../../ducks/fagsaker";

import EditerbartElement, { Status } from "../editerbartElement";
import Soknadsperiode from "./soknadsperiode";
import Soknadslandvelger from "./soknadslandvelger";
import { EditerbareUtenlandsoppdragetSporsmal, IkkeEditerbareUtenlandsoppdragetSporsmal } from "./sporsmal";
import Tittellinje from "./tittellinje";

import "./utenlandsoppdraget.css";

type UtenlandsoppdragetProps = {
  visArbeidsforholdRolleEtiketter: boolean;
  redigerbart: boolean;
  lagreSoknadOgOppfriskSaksopplysninger: () => void;
};

export const Utenlandsoppdraget = ({
  visArbeidsforholdRolleEtiketter,
  redigerbart,
  lagreSoknadOgOppfriskSaksopplysninger,
}: UtenlandsoppdragetProps) => {
  const dispatch = useDispatch();
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);

  const lagreHandler = () => {
    dispatch(mottatteOpplysningerOperations.oppdaterState());
    return true;
  };

  return (
    <div className="utenlandsoppdraget">
      <Tittellinje
        tittel={KV.Menypunkter.Utenlandsoppdraget.tittel}
        visArbeidsforholdRolleEtiketter={visArbeidsforholdRolleEtiketter}
      />
      <Nav.Row>
        <Nav.Column xs="6">
          <Soknadsperiode
            redigerbart={redigerbart}
            lagreSoknadOgOppfriskSaksopplysninger={lagreSoknadOgOppfriskSaksopplysninger}
            tittel={KV.Menypunkter.Utenlandsoppdraget.undertitler.periode}
          />
        </Nav.Column>
        {sakstype !== MKV.Koder.sakstyper.FTRL && (
          <Nav.Column xs="6">
            <Soknadslandvelger
              redigerbart={redigerbart}
              lagreSoknadOgOppfriskSaksopplysninger={lagreSoknadOgOppfriskSaksopplysninger}
            />
          </Nav.Column>
        )}
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <EditerbartElement
            redigerbart={redigerbart}
            harData
            tittel="Tilleggsopplysninger"
            visLagreKnapp
            onLagreClick={lagreHandler}
            symbolsynlighet={{
              [Status.RedigeringUtfort]: { bin: false, pencil: true },
            }}
            redigererRender={() => <EditerbareUtenlandsoppdragetSporsmal />}
            redigeringUtfortRender={() => <IkkeEditerbareUtenlandsoppdragetSporsmal />}
          />
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};

export default Utenlandsoppdraget;
