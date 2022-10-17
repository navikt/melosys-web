import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import MKV from "../../../../../melosyskodeverk";
import * as Mui from "../../../../ui";
import * as Symboler from "../../symboler";

import { Status } from "../../editerbartElement";
import RedigererKomponent from "./redigerer";
import RedigeringUtfortKomponent from "./redigeringUtfort";

import { useFeatureToggle } from "../../../../../featuretoggle";
import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from "../../../../../ducks/behandlingsgrunnlag";

import "./soknadslandvelger.css";

interface SoknadslandvelgerProps {
  redigerbart: boolean;
  lagreSoknadOgOppfriskSaksopplysninger: () => void;
}

const Soknadslandvelger = ({ redigerbart, lagreSoknadOgOppfriskSaksopplysninger }: SoknadslandvelgerProps) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState<Status>(Status.RedigeringUtfort);
  const behandlingHarPeriode = useSelector(behandlingsgrunnlagSelectors.HarPeriodeSelector);
  const tomLandOgPeriodeToggle = useFeatureToggle("melosys.tom_periode_og_land");

  const flytMedInngangsvilkår = window.location.pathname.indexOf(`${MKV.Koder.sakstyper.EU_EOS}/saksbehandling/`) > -1;

  const lagre = () => {
    setStatus(Status.RedigeringUtfort);
    if (tomLandOgPeriodeToggle === "enabled" && flytMedInngangsvilkår && behandlingHarPeriode) {
      lagreSoknadOgOppfriskSaksopplysninger();
    } else {
      dispatch(behandlingsgrunnlagOperations.oppdaterState());
    }
  };
  return (
    <div className="soknadslandvelger">
      {redigerbart && status === Status.Redigerer ? (
        <>
          <RedigererKomponent />
          <Mui.Knapp onClick={lagre} className="lagreknapp">
            Lagre
          </Mui.Knapp>
        </>
      ) : (
        <div className="redigeringutfort-container">
          <RedigeringUtfortKomponent className="redigering-utfort-komponent" />
          <div className="rediger-knapp-container">
            {redigerbart && <Symboler.Rediger onClick={() => setStatus(Status.Redigerer)} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default Soknadslandvelger;
