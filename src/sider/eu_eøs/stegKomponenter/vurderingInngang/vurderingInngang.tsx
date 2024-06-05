import { useDispatch, useSelector } from "react-redux";
import * as Nav from "../../../../navFrontend";
import * as Api from "../../../../services/api";
import * as Mui from "../../../../felleskomponenter/ui";
import MKV, { MKVUtils } from "../../../../melosyskodeverk";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { vilkarOperations } from "../../../../ducks/vilkar";
import "./vurderingInngang.css";
import { useEffect, useState } from "react";
import Varsler from "./varsler";

type VurderingInngangProps = {
  bekreftOgFortsett: () => void;
  redigerbart: boolean;
  oppfyllerInngangsvilkar: boolean;
  inngangsvilkaar: Api.Vilkar.Vilkaar | undefined;
};

export const VurderingInngang = ({
  bekreftOgFortsett,
  redigerbart,
  oppfyllerInngangsvilkar,
  inngangsvilkaar,
}: VurderingInngangProps) => {
  const dispatch = useDispatch();
  const [feil, setFeil] = useState<string | undefined>(undefined);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const behandlingHarPeriodeOgLand = useSelector(mottatteOpplysningerSelectors.HarPeriodeOgLandSelector);
  const landkoder = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector);
  const flereLandUkjentHvilke = useSelector(mottatteOpplysningerSelectors.SoknadslandFlereLandUkjentHvilkeSelector);

  useEffect(() => {
    const flereEnnEttLand = landkoder.length > 1 || flereLandUkjentHvilke;

    if (flereEnnEttLand && !MKVUtils.kanHaFlereSoknadsland(behandlingstema)) {
      setFeil(
        "Du har valgt et behandlingstema som kun tillater ett arbeidsland. " +
          "Du må fjerne land under “Periode og land” i sidemenyen eller endre behandlingstema."
      );
    } else if (!flereEnnEttLand && behandlingstema === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND) {
      setFeil(
        "Det er påkrevd med to eller flere land for valgt behandlingstema. " +
          "Du må legge til land under “Periode og land” i sidemenyen eller endre behandlingstema."
      );
    } else {
      setFeil(undefined);
    }
  }, [landkoder, flereLandUkjentHvilke, behandlingstema]);

  const knappClickHandler = async () => {
    if (!oppfyllerInngangsvilkar) {
      await Api.Vilkar.overstyrInngangvilkaar(behandlingID);
      await dispatch(vilkarOperations.hent(behandlingID));
    }

    bekreftOgFortsett();
  };

  return (
    <div className="vurderinginngang_eu_eos">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Kontroller inngangsvilkår</Nav.Typo.Innholdstittel>
      <Varsler
        oppfyllerInngangsvilkar={oppfyllerInngangsvilkar}
        inngangsvilkaar={inngangsvilkaar}
        landkoder={landkoder}
        behandlingstema={behandlingstema}
        behandlingHarPeriodeOgLand={behandlingHarPeriodeOgLand}
      />
      {feil && <Nav.Alert variant="error">{feil}</Nav.Alert>}
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !redigerbart || Boolean(feil),
          onClick: knappClickHandler,
        }}
      />
    </div>
  );
};

export default VurderingInngang;
