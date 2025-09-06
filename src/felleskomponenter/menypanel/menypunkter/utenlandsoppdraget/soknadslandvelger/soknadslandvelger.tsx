import { useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "../../../../../hooks";

import MKV from "../../../../../melosyskodeverk";
import * as Symboler from "../../symboler";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";
import * as KV from "../../../../../kodeverk";

import { Status } from "../../editerbartElement";
import RedigererKomponent from "./redigerer";
import {
  mottatteOpplysningerOperations,
  mottatteOpplysningerSelectors,
} from "../../../../../ducks/mottatteOpplysninger";

import "./soknadslandvelger.less";

interface SoknadslandvelgerProps {
  redigerbart: boolean;
  lagreSoknadOgOppfriskSaksopplysninger: () => void;
}

function Soknadslandvelger({ redigerbart, lagreSoknadOgOppfriskSaksopplysninger }: SoknadslandvelgerProps) {
  const dispatch = useDispatch();
  const [status, setStatus] = useState<Status>(Status.RedigeringUtfort);

  const behandlingHarPeriode = useSelector(mottatteOpplysningerSelectors.HarPeriodeSelector);
  const soknadsland = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector);
  const flereLandUkjentHvilke = useSelector(mottatteOpplysningerSelectors.SoknadslandFlereLandUkjentHvilkeSelector);

  const flytMedInngangsvilkår = window.location.pathname.indexOf(`${MKV.Koder.sakstyper.EU_EOS}/saksbehandling/`) > -1;

  const lagre = () => {
    setStatus(Status.RedigeringUtfort);
    if (flytMedInngangsvilkår && behandlingHarPeriode) {
      lagreSoknadOgOppfriskSaksopplysninger();
    } else {
      dispatch(mottatteOpplysningerOperations.oppdaterState());
    }
  };

  const avbryt = () => {
    setStatus(Status.RedigeringUtfort);
  };

  const soknadslandTekst = flereLandUkjentHvilke
    ? "Flere land. Ikke kjent hvilke."
    : Utils.streng.arrayTilKonjunksjon(
        soknadsland.map((land: string) => KV.kodeTilTerm(land, MKV.KTObjects.landkoder)),
      ) || "Ingen land valgt";

  return (
    <div className="soknadslandvelger">
      <Nav.BodyLong size="small" className="soknadsland__etikett">
        Land
      </Nav.BodyLong>
      {redigerbart && status === Status.Redigerer ? (
        <RedigererKomponent lagre={lagre} avbryt={avbryt} />
      ) : (
        <div className="redigeringutfort-container">
          <Nav.BodyLong weight="semibold" size="small">
            {soknadslandTekst}
          </Nav.BodyLong>
          <div>{redigerbart && <Symboler.Rediger onClick={() => setStatus(Status.Redigerer)} />}</div>
        </div>
      )}
    </div>
  );
}

export default Soknadslandvelger;
