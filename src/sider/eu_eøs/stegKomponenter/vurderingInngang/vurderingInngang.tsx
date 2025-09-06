import { useSelector } from "react-redux";
import { useDispatch } from "../../../../hooks";
import * as Nav from "../../../../navFrontend";
import * as Api from "../../../../services/api";
import * as Mui from "../../../../felleskomponenter/ui";
import MKV, { MKVUtils } from "../../../../melosyskodeverk";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { vilkarOperations } from "../../../../ducks/vilkar";
import "./vurderingInngang.less";
import { ReactElement, useEffect, useState } from "react";
import Varsler from "./varsler";

interface VurderingInngangProps {
  bekreftOgFortsett: () => void;
  redigerbart: boolean;
  oppfyllerInngangsvilkar: boolean;
  inngangsvilkaar: Api.Vilkar.Vilkaar | undefined;
}

export function VurderingInngang({
  bekreftOgFortsett,
  redigerbart,
  oppfyllerInngangsvilkar,
  inngangsvilkaar,
}: VurderingInngangProps) {
  const dispatch = useDispatch();
  const [feil, setFeil] = useState<ReactElement | undefined>(undefined);
  const behandlingID: number = useSelector(behandlingerSelectors.BehandlingIDSelector) as number;
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const behandlingHarPeriodeOgLand = useSelector(mottatteOpplysningerSelectors.HarPeriodeOgLandSelector);
  const landkoder = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector);
  const flereLandUkjentHvilke = useSelector(mottatteOpplysningerSelectors.SoknadslandFlereLandUkjentHvilkeSelector);

  useEffect(() => {
    const flereEnnEttLand = landkoder.length > 1 || flereLandUkjentHvilke;

    if (!behandlingHarPeriodeOgLand) {
      setFeil(
        <>
          <Nav.BodyLong weight="semibold" size="small">
            Det mangler periode og/eller land
          </Nav.BodyLong>
          <ul>
            <li>Du må fylle disse inn under “Periode og land” i sidemenyen og oppdatere registeropplysninger.</li>
          </ul>
        </>,
      );
    } else if (flereEnnEttLand && !MKVUtils.kanHaFlereSoknadsland(behandlingstema)) {
      setFeil(
        <>
          <Nav.BodyLong weight="semibold" size="small">
            Du har valgt et behandlingstema som kun tillater ett arbeidsland
          </Nav.BodyLong>
          <ul>
            <li>Du må fjerne land under “Periode og land” i sidemenyen eller endre behandlingstema.</li>
          </ul>
        </>,
      );
    } else if (!flereEnnEttLand && behandlingstema === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND) {
      setFeil(
        <>
          <Nav.BodyLong weight="semibold" size="small">
            Det er påkrevd med to eller flere land for valgt behandlingstema
          </Nav.BodyLong>
          <ul>
            <li>Du må legge til land under “Periode og land” i sidemenyen eller endre behandlingstema.</li>
          </ul>
        </>,
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
      <Nav.Heading level="1" className="stegvelgertittel">
        Kontroller inngangsvilkår
      </Nav.Heading>
      <Varsler
        oppfyllerInngangsvilkar={oppfyllerInngangsvilkar}
        inngangsvilkaar={inngangsvilkaar}
        landkoder={landkoder}
        behandlingstema={behandlingstema}
        behandlingID={behandlingID}
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
}

export default VurderingInngang;
