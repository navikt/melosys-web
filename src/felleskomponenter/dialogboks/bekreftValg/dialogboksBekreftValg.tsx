import { useDispatch, useSelector } from "react-redux";

import MKV from "../../../melosyskodeverk";
import * as Api from "../../../services/api";
import * as Nav from "../../../navFrontend";

import { BekreftValgTypes } from "../../../modals/bekreftValgTypes";
import { navigeringOperations } from "../../../ducks/navigering";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { modalerOperations, modalerSelectors } from "../../../ducks/modaler";
import Knapperad from "../../knapperad";

import { useState } from "react";

const { UNNTAK_MEDLEMSKAP } = MKV.Koder.behandlinger.behandlingstema;
const { EU_EOS, FTRL, TRYGDEAVTALE } = MKV.Koder.sakstyper;
const {
  MEDHOLD,
  KLAGEINNSTILLING,
  AVVIST_KLAGE,
  AVSLAG_SØKNAD,
  OMGJORT,
  REGISTRERT_UNNTAK,
  DELVIS_GODKJENT_UNNTAK,
  MEDLEM_I_FOLKETRYGDEN,
  FASTSATT_LOVVALGSLAND,
  UNNTATT_MEDLEMSKAP,
} = MKV.Koder.behandlinger.behandlingsresultattyper;

export const DialogboksBekreftValg = () => {
  const dispatch = useDispatch();
  const [feil, setFeil] = useState(undefined);

  const saksnummer = useSelector(fagsakSelectors.SaksnummerSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const bekreftValgType = useSelector(modalerSelectors.BekreftValgTypeSelector);

  const skjulModal = () => dispatch(modalerOperations.skjulBekreftValg());

  const mapType = () => {
    switch (sakstype) {
      case FTRL:
        return behandlingstema === UNNTAK_MEDLEMSKAP ? UNNTATT_MEDLEMSKAP : MEDLEM_I_FOLKETRYGDEN;
      case EU_EOS:
      case TRYGDEAVTALE:
        return FASTSATT_LOVVALGSLAND;
      default:
        throw new Error("Finner ikke behandlingsresultattype for denne sakstypen");
    }
  };

  const håndterKall = (kallPromise: Promise<any>) =>
    kallPromise
      .then(() => {
        skjulModal();
        dispatch(navigeringOperations.tilForsiden());
      })
      .catch((error) => setFeil(error?.body?.message ?? error));

  const avsluttSakSomBortfalt = () => håndterKall(Api.Fagsaker.fagsak.bortfall(saksnummer));
  const ferdigbehandleAArsavregning = () => håndterKall(Api.Aarsavregning.ferdigbehandleAArsavregning(behandlingID));
  const ferdigbehandleSak = () => håndterKall(Api.Fagsaker.fagsak.ferdigbehandleSak(saksnummer));
  const angiBehandlingsresultattype = (type: string) =>
    håndterKall(Api.Behandlinger.resultat.angiBehandlingsresultattype(behandlingID, { type }));
  const annullerFagsak = () => håndterKall(Api.Fagsaker.fagsak.annullerFagsak(saksnummer));

  const hentBekreftValgDialogDataFraType = () => {
    switch (bekreftValgType) {
      case BekreftValgTypes.FERDIGSTILL_AARSAVREGNING:
        return {
          tittel: "Ferdigbehandlet",
          tekst: "Er du sikker på at årsavregningen skal ferdigbehandles?",
          handleBekreft: ferdigbehandleAArsavregning,
        };
      case BekreftValgTypes.FERDIGBEHANDLET:
        return {
          tittel: "Ferdigbehandlet",
          tekst: "Er du sikker på at saken er ferdigbehandlet? Vurder om du bør skrive et notat og/eller brev.",
          handleBekreft: ferdigbehandleSak,
        };

      case BekreftValgTypes.VEDTAKET_ER_OMGJORT:
        return {
          tittel: "Vedtaket er omgjort (fvl §35)",
          tekst: "Er du sikker på at du vil avslutte saken? Husk å sende vedtak før du bekrefter.",
          handleBekreft: () => angiBehandlingsresultattype(OMGJORT),
        };

      case BekreftValgTypes.SOKNADEN_ER_INNVILGET:
        return {
          tittel: "Søknaden er innvilget",
          tekst: "Er du sikker på at du vil avslutte saken? Husk å sende vedtak før du bekrefter.",
          handleBekreft: () => angiBehandlingsresultattype(mapType()),
        };

      case BekreftValgTypes.SOKNADEN_ER_AVSLATT:
        return {
          tittel: "Søknaden er avslått",
          tekst: "Er du sikker på at du vil avslutte saken? Husk å sende vedtak før du bekrefter.",
          handleBekreft: () => angiBehandlingsresultattype(AVSLAG_SØKNAD),
        };

      case BekreftValgTypes.PERIODEN_ER_GODKJENT:
        return {
          tittel: "Perioden er godkjent",
          tekst:
            "Er du sikker på at du vil avslutte saken? Vurder om du skal registrere periode i MEDL/skrive notat/etc.",
          handleBekreft: () => angiBehandlingsresultattype(REGISTRERT_UNNTAK),
        };

      case BekreftValgTypes.PERIODEN_ER_DELVIS_GODKJENT:
        return {
          tittel: "Perioden er delvis godkjent",
          tekst:
            "Er du sikker på at du vil avslutte saken? Vurder om du skal registrere periode i MEDL/skrive notat/etc.",
          handleBekreft: () => angiBehandlingsresultattype(DELVIS_GODKJENT_UNNTAK),
        };

      case BekreftValgTypes.MEDLEM_I_FOLKETRYGDEN:
        return {
          tittel: "Medlem i folketrygden",
          tekst:
            "Er du sikker på at du vil avslutte saken? Vurder om du skal registrere periode i MEDL/skrive notat/etc.",
          handleBekreft: () => angiBehandlingsresultattype(MEDLEM_I_FOLKETRYGDEN),
        };

      case BekreftValgTypes.KLAGE_MEDHOLD:
        return {
          tittel: "Medhold på klage",
          tekst: "Er du sikker på at du vil avslutte saken? Husk å sende vedtak før du bekrefter.",
          handleBekreft: () => angiBehandlingsresultattype(MEDHOLD),
        };

      case BekreftValgTypes.KLAGE_AVVIST:
        return {
          tittel: "Klage er avvist",
          tekst: "Er du sikker på at du vil avslutte saken? Husk å sende vedtak før du bekrefter.",
          handleBekreft: () => angiBehandlingsresultattype(AVVIST_KLAGE),
        };

      case BekreftValgTypes.KLAGE_OVERSENDT_TIL_KLAGEINSTANSER:
        return {
          tittel: "Klageinnstilling er oversendt til klageinstansen",
          tekst: "Er du sikker på at du vil avslutte saken? Husk å sende innstillingen før du bekrefter.",
          handleBekreft: () => angiBehandlingsresultattype(KLAGEINNSTILLING),
        };

      case BekreftValgTypes.AVSLUTT_SAK_SOM_BORTFALT:
        return {
          tittel: "Avslutt sak som bortfalt",
          tekst: "Er du sikker på at saken ikke kan behandles i Melosys? Vurder om du må opprette sak i annet system.",
          handleBekreft: avsluttSakSomBortfalt,
        };

      case BekreftValgTypes.SAKEN_ER_ANNULLERT:
        return {
          tittel: "Saken er annullert",
          tekst: (
            <>
              Hvis du annullerer saken vil alle perioder knyttet til saken annulleres og fjernes fra MEDL og ev.
              fakturering vil stoppes.
              <br />
              Hvis periodene i MEDL er registrert manuelt må du også huske å fjerne disse. Vurder også om du må sende
              brev/vedtak til bruker.
              <br />
              Er du sikker på at du vil annullere saken?
            </>
          ),
          handleBekreft: annullerFagsak,
        };

      default:
        return {};
    }
  };

  const bekreftValgTypeData = hentBekreftValgDialogDataFraType();

  return (
    <Nav.Modal
      onClose={skjulModal}
      open
      header={{ heading: bekreftValgTypeData.tittel || "", closeButton: false }}
      closeOnBackdropClick
    >
      <Nav.Modal.Body>
        <Nav.Typo.Normaltekst className="normaltekst">{bekreftValgTypeData.tekst}</Nav.Typo.Normaltekst>
        {feil && (
          <Nav.Alert variant="error" className="feilmelding">
            {feil}
          </Nav.Alert>
        )}
      </Nav.Modal.Body>
      <Nav.Modal.Footer>
        <Knapperad
          bekreft={bekreftValgTypeData.handleBekreft}
          bekreftTekst="Bekreft"
          bekreftRedigerbart={!feil}
          avbryt={skjulModal}
          avbrytTekst="Avbryt"
          redigerbart
        />
      </Nav.Modal.Footer>
    </Nav.Modal>
  );
};

export default DialogboksBekreftValg;
