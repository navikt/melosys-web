import { useSelector } from "react-redux";
import { ChangeEvent, useEffect } from "react";
import { KTObject } from "@navikt/melosys-kodeverk";
import MKV, { MKVUtils } from "../../../melosyskodeverk";
import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";
import * as Mui from "../../../felleskomponenter/ui";
import SokkelSkipListe from "../../../felleskomponenter/sokkelskipliste";
import {
  konverterAvklartfaktaTilStegData,
  lagAvklartefaktaBegrunnelse,
  lagAvklartfakta,
  lagVilkaar,
  slettVilkar,
} from "../../../felleskomponenter/stegvelger";
import { hentFaktaVerdi } from "../../../domeneUtils";

import { formSelectors } from "../../../ducks/form";
import "./vurderingSokkelSkip.css";
import { Avklartfakta } from "../../../services/modules/avklartefakta";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { useFeatureToggle } from "../../../featuretoggle";
import { MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA } from "../../../featuretoggle/toggleNavn";

interface Props {
  begrunnelser: KTObject[];
  bekreftOgFortsett: () => void;
  maritimtArbeid: string[];
  tilstand: {
    harAvklaring: boolean;
    sokkelSkipKonklusjon: Avklartfakta;
    sokkelEllerSkipListe: Avklartfakta[];
    installasjonArbeidslandListe: Avklartfakta[];
    installasjonArbeidslandTypeListe: Avklartfakta[];
    arbeidslandListe: Avklartfakta[];
  };
  redigerbart: boolean;
  oppdaterData: (objekt: any) => void;
  slettData: (objekt?: any) => void;
  tilbake: () => void;
}

const VurderingSokkelSkip = ({
  tilstand: {
    harAvklaring,
    sokkelSkipKonklusjon,
    sokkelEllerSkipListe,
    installasjonArbeidslandListe,
    installasjonArbeidslandTypeListe,
    arbeidslandListe,
  },
  oppdaterData,
  slettData,
  bekreftOgFortsett,
  begrunnelser,
  redigerbart,
  tilbake,
}: Props) => {
  const konvensjonStorbritanniaToggleEnabled = useFeatureToggle(MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA);
  const maritimtArbeid = useSelector(formSelectors.MaritimtArbeidSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  useEffect(() => {
    oppdaterData(
      konverterAvklartfaktaTilStegData(KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP, sokkelSkipKonklusjon)
    );
    return () => {
      slettData();
    };
  }, []);

  const avklartefaktaEndret = (type: string, subjektID: string | null, verdi: string) => {
    oppdaterData(lagAvklartfakta(type, subjektID, verdi, null));
  };

  const avklartefaktaBegrunnelseEndret = (type: string, subjektID: string, verdi: string) => {
    oppdaterData(lagAvklartefaktaBegrunnelse(type, subjektID, [verdi]));
  };

  const konklusjonEndretHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    avklartefaktaEndret(KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP, null, value);

    if (value === KV.Koder.VurderingSokkelSkipTyper.SOKKEL_NORSK) {
      oppdaterData(lagVilkaar("art11_3A", true));
    } else {
      slettData(slettVilkar("art11_3A"));
    }
  };

  const fakta = hentFaktaVerdi(sokkelSkipKonklusjon);

  const { VurderingSokkelSkipTyper } = KV.Koder;
  const harMaritimeArbeidUnikeNavn = Utils.erPropertyUnik(
    maritimtArbeid,
    (enkeltMaritimtArbeid) => enkeltMaritimtArbeid.enhetNavn
  );

  return (
    <div className="vurderingSokkelSkip">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Vurdering av sokkel eller skip</Nav.Typo.Innholdstittel>
      <SokkelSkipListe
        sokkelEllerSkipListe={sokkelEllerSkipListe}
        installasjonArbeidslandListe={installasjonArbeidslandListe}
        installasjonArbeidslandTypeListe={installasjonArbeidslandTypeListe}
        arbeidslandListe={arbeidslandListe}
        maritimtArbeid={maritimtArbeid}
        begrunnelser={begrunnelser}
        redigerbart={redigerbart && harMaritimeArbeidUnikeNavn}
        avklartefaktaEndretHandler={avklartefaktaEndret}
        avklartefaktaBegrunnelserEndretHandler={avklartefaktaBegrunnelseEndret}
        oppdaterData={oppdaterData}
        slettData={slettData}
      />
      {maritimtArbeid.length === 0 && (
        <div className="sokkelSkip__varsel">
          <Nav.Alert variant="warning">Det er ikke registrert verken sokkel eller skip.</Nav.Alert>
        </div>
      )}
      {!harMaritimeArbeidUnikeNavn && (
        <div className="sokkelSkip__varsel">
          <Nav.Alert variant="warning">Det er registrert flere maritime arbeid med samme navn.</Nav.Alert>
        </div>
      )}
      <Nav.Fieldset legend="Hvordan arbeider søkeren:">
        <Nav.Radio
          name={KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP}
          disabled={
            !redigerbart ||
            (konvensjonStorbritanniaToggleEnabled
              ? MKVUtils.erUtsendt(behandlingstema)
              : behandlingstema === MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER)
          }
          onChange={konklusjonEndretHandler}
          checked={fakta === VurderingSokkelSkipTyper.SOKKEL_NORSK}
          value={VurderingSokkelSkipTyper.SOKKEL_NORSK}
          label="På norsk sokkel eller innenfor norsk territorialfarvann (art. 11.3.a)"
        />
        <Nav.Radio
          name={KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP}
          disabled={!redigerbart}
          onChange={konklusjonEndretHandler}
          checked={fakta === VurderingSokkelSkipTyper.SKIP_ETT_LAND}
          value={VurderingSokkelSkipTyper.SKIP_ETT_LAND}
          label="På skip registrert i ett land"
        />
        <Nav.Radio
          name={KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP}
          disabled={!redigerbart}
          onChange={konklusjonEndretHandler}
          checked={fakta === VurderingSokkelSkipTyper.SOKKEL_UTLAND}
          value={VurderingSokkelSkipTyper.SOKKEL_UTLAND}
          label={
            konvensjonStorbritanniaToggleEnabled
              ? "Utsendt til sokkel eller til annet lands territorialfarvann"
              : "Utsendt til sokkel eller til annet lands territorialfarvann (art. 12)"
          }
        />
        {!konvensjonStorbritanniaToggleEnabled && (
          <Nav.Radio
            name={KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP}
            disabled
            onChange={konklusjonEndretHandler}
            checked={fakta === VurderingSokkelSkipTyper.SOKKEL_ELLER_SKIP_FLERE_LAND}
            value={VurderingSokkelSkipTyper.SOKKEL_ELLER_SKIP_FLERE_LAND}
            label="To sokler / skip i flere land (art. 13)"
          />
        )}
      </Nav.Fieldset>
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !(redigerbart && harAvklaring),
          onClick: bekreftOgFortsett,
        }}
        tilbakeKnappProps={{
          onClick: tilbake,
          disabled: !redigerbart,
        }}
      />
    </div>
  );
};

export default VurderingSokkelSkip;
