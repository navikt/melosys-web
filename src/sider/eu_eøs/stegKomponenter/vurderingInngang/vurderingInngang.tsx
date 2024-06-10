import { useDispatch, useSelector } from "react-redux";
import * as Nav from "../../../../navFrontend";
import * as Api from "../../../../services/api";
import * as Mui from "../../../../felleskomponenter/ui";
import MKV, { MKVUtils } from "../../../../melosyskodeverk";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { vilkarOperations } from "../../../../ducks/vilkar";
import "./vurderingInngang.css";
import { ReactElement, useEffect, useState } from "react";
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
  const [feil, setFeil] = useState<ReactElement | undefined>(undefined);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const behandlingHarPeriodeOgLand = useSelector(mottatteOpplysningerSelectors.HarPeriodeOgLandSelector);
  const landkoder = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector);
  const flereLandUkjentHvilke = useSelector(mottatteOpplysningerSelectors.SoknadslandFlereLandUkjentHvilkeSelector);

  useEffect(() => {
    const flereEnnEttLand = landkoder.length > 1 || flereLandUkjentHvilke;

    if (!behandlingHarPeriodeOgLand) {
      setFeil(
        <>
          <Nav.Typo.Element>Det mangler periode og/eller land</Nav.Typo.Element>
          <ul>
            <li>Du må fylle disse inn under “Periode og land” i sidemenyen og oppdatere registeropplysninger.</li>
          </ul>
        </>
      );
    } else if (flereEnnEttLand && !MKVUtils.kanHaFlereSoknadsland(behandlingstema)) {
      setFeil(
        <>
          <Nav.Typo.Element>Du har valgt et behandlingstema som kun tillater ett arbeidsland</Nav.Typo.Element>
          <ul>
            <li>Du må fjerne land under “Periode og land” i sidemenyen eller endre behandlingstema.</li>
          </ul>
        </>
      );
    } else if (!flereEnnEttLand && behandlingstema === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND) {
      setFeil(
        <>
          <Nav.Typo.Element>Det er påkrevd med to eller flere land for valgt behandlingstema</Nav.Typo.Element>
          <ul>
            <li>Du må legge til land under “Periode og land” i sidemenyen eller endre behandlingstema.</li>
          </ul>
        </>
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
      />
      {feil && (
        <Nav.Alert variant="error" className="periode_land_feil">
          {feil}
        </Nav.Alert>
      )}
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
