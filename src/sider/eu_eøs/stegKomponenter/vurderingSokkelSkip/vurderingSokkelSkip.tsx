import { useSelector } from "react-redux";
import { useEffect } from "react";
import { KTObject } from "@navikt/melosys-kodeverk";
import MKV, { MKVUtils } from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Mui from "../../../../felleskomponenter/ui";
import SokkelSkipListe from "../../../../felleskomponenter/sokkelskipliste";
import {
  konverterAvklartfaktaTilStegData,
  lagAvklartefaktaBegrunnelse,
  lagAvklartfakta,
  lagVilkaar,
  slettVilkar,
} from "../../../../felleskomponenter/stegvelger";
import { hentFaktaVerdi } from "../../../../domeneUtils";

import { formSelectors } from "../../../../ducks/form";
import "./vurderingSokkelSkip.css";
import { Avklartfakta } from "../../../../services/modules/avklartefakta";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { useFeatureToggle } from "../../../../featuretoggle";
import {
  MELOSYS_ARBEID_KUN_NORGE,
  MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA,
} from "../../../../featuretoggle/toggleNavn";
import { Feilmelding, finnAktivFeilmelding } from "./feilmeldinger";
import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";

interface Props {
  begrunnelser: KTObject[];
  bekreftOgFortsett: () => void;
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
const { UTSENDT_ARBEIDSTAKER, UTSENDT_SELVSTENDIG, ARBEID_KUN_NORGE } = MKV.Koder.behandlinger.behandlingstema;

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
  const arbeidKunNorgeToggleEnabled = useFeatureToggle(MELOSYS_ARBEID_KUN_NORGE);
  const maritimtArbeid = useSelector(formSelectors.MaritimtArbeidSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);

  const erUtsendt = [UTSENDT_ARBEIDSTAKER, UTSENDT_SELVSTENDIG].includes(behandlingstema);
  const erArbeidslandNorge = useSelector(avklartefaktaSelectors.ArbeidslandKTSelector).some(
    (land: any) => land.kode === "NO"
  );
  const erArbeidKunNorgeBehandlingstema = behandlingstema === ARBEID_KUN_NORGE;

  const skalViseArbeidKunNorgeFlyt =
    (erUtsendt || erArbeidKunNorgeBehandlingstema) && erArbeidslandNorge && arbeidKunNorgeToggleEnabled;

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

  const konklusjonEndretHandler = (value: string) => {
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

  const aktivFeilmelding = finnAktivFeilmelding(
    sokkelSkipKonklusjon,
    sokkelEllerSkipListe,
    arbeidslandListe,
    maritimtArbeid
  );
  const visFeilmeldinger = redigerbart && aktivFeilmelding;

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
      <Nav.RadioGroup
        legend="Hvordan arbeider søkeren:"
        onChange={konklusjonEndretHandler}
        readOnly={!redigerbart}
        name={KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP}
        defaultValue={fakta}
      >
        <Nav.Radio
          readOnly={
            (konvensjonStorbritanniaToggleEnabled
              ? MKVUtils.erUtsendt(behandlingstema)
              : behandlingstema === MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER) && !erArbeidslandNorge
          }
          value={VurderingSokkelSkipTyper.SOKKEL_NORSK}
        >
          På norsk sokkel eller innenfor norsk territorialfarvann (art. 11.3.a)
        </Nav.Radio>
        <Nav.Radio value={VurderingSokkelSkipTyper.SKIP_ETT_LAND}>På skip registrert i ett land</Nav.Radio>
        <Nav.Radio readOnly={skalViseArbeidKunNorgeFlyt} value={VurderingSokkelSkipTyper.SOKKEL_UTLAND}>
          {konvensjonStorbritanniaToggleEnabled
            ? "Utsendt til sokkel eller til annet lands territorialfarvann"
            : "Utsendt til sokkel eller til annet lands territorialfarvann (art. 12)"}
        </Nav.Radio>
        {!konvensjonStorbritanniaToggleEnabled && (
          <Nav.Radio disabled value={VurderingSokkelSkipTyper.SOKKEL_ELLER_SKIP_FLERE_LAND}>
            To sokler / skip i flere land (art. 13)
          </Nav.Radio>
        )}
      </Nav.RadioGroup>
      {visFeilmeldinger && <Feilmelding type={aktivFeilmelding} />}
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !(redigerbart && harAvklaring && aktivFeilmelding === undefined),
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
