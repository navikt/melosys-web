import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

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

import "./soknadslandvelger.css";

interface SoknadslandvelgerProps {
  redigerbart: boolean;
  lagreSoknadOgOppfriskSaksopplysninger: () => void;
}

const Soknadslandvelger = ({ redigerbart, lagreSoknadOgOppfriskSaksopplysninger }: SoknadslandvelgerProps) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState<Status>(Status.RedigeringUtfort);

  const behandlingHarPeriode = useSelector(mottatteOpplysningerSelectors.HarPeriodeSelector);
  const soknadsland = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector);
  const soknadslandErUkjenteEllerAlleEosLand = useSelector(
    mottatteOpplysningerSelectors.SoknadslandErUkjenteEllerAlleEosLandSelector
  );

  const flytMedInngangsvilkår = window.location.pathname.indexOf(`${MKV.Koder.sakstyper.EU_EOS}/saksbehandling/`) > -1;

  const lagre = () => {
    setStatus(Status.RedigeringUtfort);
    if (flytMedInngangsvilkår && behandlingHarPeriode) {
      lagreSoknadOgOppfriskSaksopplysninger();
    } else {
      dispatch(mottatteOpplysningerOperations.oppdaterState());
    }
  };

  const soknadslandTekst = soknadslandErUkjenteEllerAlleEosLand ? (
    "Flere EØS-land/Sveits. Ikke kjent hvilke."
  ) : (
    <Nav.Typo.Element className="element">
      {Utils.streng.arrayTilKonjunksjon(
        soknadsland.map((land: string) => KV.kodeTilTerm(land, MKV.KTObjects.landkoder))
      ) || "Ingen land valgt"}
    </Nav.Typo.Element>
  );

  return (
    <div className="soknadslandvelger">
      <Nav.Typo.Normaltekst className="soknadsland__etikett">Land</Nav.Typo.Normaltekst>
      {redigerbart && status === Status.Redigerer ? (
        <RedigererKomponent lagre={lagre} />
      ) : (
        <div className="redigeringutfort-container">
          <Nav.Typo.Element>{soknadslandTekst}</Nav.Typo.Element>
          <div>{redigerbart && <Symboler.Rediger onClick={() => setStatus(Status.Redigerer)} />}</div>
        </div>
      )}
    </div>
  );
};

export default Soknadslandvelger;
