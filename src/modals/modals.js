import React, { Fragment } from "react";
import PT from "prop-types";
import { connect } from "react-redux";

import * as Nav from "../navFrontend";

import { FellesHandlersContext } from "../contexts";
import { modalerOperations, modalerSelectors } from "../ducks/modaler";

import {
  DialogboksAvslagSoknad,
  DialogboksAvsluttSakSomBortfalt,
  DialogboksBekreftValg,
  DialogboksHenleggSak,
  DialogboksOppfriskSak,
} from "../felleskomponenter/dialogboks";
import { BekreftValgTypes } from "./bekreftValgTypes";
import * as Api from "../services/api";
import MKV from "../melosyskodeverk";
import { behandlingerSelectors } from "../ducks/behandlinger";
import { tilForsiden } from "../ducks/navigering/operations";
import { fagsakSelectors } from "../ducks/fagsaker";

Nav.Modal.setAppElement(document.getElementById("root"));

const Modals = ({
  skjulOppfriskModalOgNavigerTilForside,
  visOppfriskDialog,
  lagreMottatteOpplysningerOgOppfriskSaksopplysninger,
  skjulOppfriskModal,
  lukkOppfriskModal,
  visHenleggDialog,
  skjulHenleggDialogHandle,
  henleggHandle,
  visAvslagSoknadDialog,
  skjulAvslagSoknadDialogHandle,
  avslaaSoknadHandle,
  visAvsluttSakSomBortfaltDialog,
  skjulAvsluttSakSomBortfaltDialogHandle,
  avsluttSakSomBortfalt,
  visBekreftValgDialog,
  skjulBekreftValgDialogHandle,
  ferdigbehandleSak,
  behandlingOppfriskes,
  annenBehandlingOppfriskes,
  bekreftValgType,
  behandlingID,
  sakstype,
  behandlingstema,
}) => {
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

  const { UNNTAK_MEDLEMSKAP } = MKV.Koder.behandlinger.behandlingstema;

  const { EU_EOS, FTRL, TRYGDEAVTALE } = MKV.Koder.sakstyper;

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
  const angiBehandlingsresultattype = async (type) => {
    await Api.Behandlinger.resultat.angiBehandlingsresultattype(behandlingID, { type });
    tilForsiden();
  };

  const hentBekreftValgDialogDataFraType = () => {
    switch (bekreftValgType) {
      case BekreftValgTypes.FERDIGBEHANDLET:
        return {
          tittel: "Ferdigbehandlet",
          tekst: "Er du sikker på at saken er ferdigbehandlet? Vurder om du bør skrive et notat og/eller brev.",
          bekreftCallback: ferdigbehandleSak,
        };
      case BekreftValgTypes.VEDTAKET_ER_OMGJORT:
        return {
          tittel: "Vedtaket er omgjort (fvl §35)",
          tekst: "Er du sikker på at du vil avslutte saken? Husk å sende vedtak før du bekrefter.",
          bekreftCallback: () => angiBehandlingsresultattype(OMGJORT),
        };

      case BekreftValgTypes.SOKNADEN_ER_INNVILGET:
        return {
          tittel: "Søknaden er innvilget",
          tekst: "Er du sikker på at du vil avslutte saken? Husk å sende vedtak før du bekrefter.",
          bekreftCallback: () => angiBehandlingsresultattype(mapType()),
        };
      case BekreftValgTypes.SOKNADEN_ER_AVSLATT:
        return {
          tittel: "Søknaden er avslått",
          tekst: "Er du sikker på at du vil avslutte saken? Husk å sende vedtak før du bekrefter.",
          bekreftCallback: () => angiBehandlingsresultattype(AVSLAG_SØKNAD),
        };
      case BekreftValgTypes.PERIODEN_ER_GODKJENT:
        return {
          tittel: "Perioden er godkjent",
          tekst:
            "Er du sikker på at du vil avslutte saken? Vurder om du skal registrere periode i MEDL/skrive notat/etc.",
          bekreftCallback: () => angiBehandlingsresultattype(REGISTRERT_UNNTAK),
        };
      case BekreftValgTypes.PERIODEN_ER_DELVIS_GODKJENT:
        return {
          tittel: "Perioden er delvis godkjent",
          tekst:
            "Er du sikker på at du vil avslutte saken? Vurder om du skal registrere periode i MEDL/skrive notat/etc.",
          bekreftCallback: () => angiBehandlingsresultattype(DELVIS_GODKJENT_UNNTAK),
        };
      case BekreftValgTypes.MEDLEM_I_FOLKETRYGDEN:
        return {
          tittel: "Medlem i folketrygden",
          tekst:
            "Er du sikker på at du vil avslutte saken? Vurder om du skal registrere periode i MEDL/skrive notat/etc.",
          bekreftCallback: () => angiBehandlingsresultattype(MEDLEM_I_FOLKETRYGDEN),
        };

      case BekreftValgTypes.KLAGE_MEDHOLD:
        return {
          tittel: "Medhold på klage",
          tekst: "Er du sikker på at du vil avslutte saken? Husk å sende vedtak før du bekrefter.",
          bekreftCallback: () => angiBehandlingsresultattype(MEDHOLD),
        };

      case BekreftValgTypes.KLAGE_AVVIST:
        return {
          tittel: "Klage er avvist",
          tekst: "Er du sikker på at du vil avslutte saken? Husk å sende vedtak før du bekrefter.",
          bekreftCallback: () => angiBehandlingsresultattype(AVVIST_KLAGE),
        };

      case BekreftValgTypes.KLAGE_OVERSENDT_TIL_KLAGEINSTANSER:
        return {
          tittel: "Klageinnstilling er oversendt til klageinstansen",
          tekst: "Er du sikker på at du vil avslutte saken? Husk å sende innstillingen før du bekrefter.",
          bekreftCallback: () => angiBehandlingsresultattype(KLAGEINNSTILLING),
        };

      case BekreftValgTypes.AVSLUTT_SAK_SOM_BORTFALT:
        return {
          tittel: "Avslutt sak som bortfalt",
          tekst: "Er du sikker på at saken ikke kan behandles i Melosys? Vurder om du må opprette sak i annet system.",
          bekreftCallback: () => avsluttSakSomBortfalt(),
        };

      default:
        return {};
    }
  };

  const bekreftValgTypeData = hentBekreftValgDialogDataFraType();

  return (
    <Fragment>
      {visOppfriskDialog && (
        <DialogboksOppfriskSak
          oppfrisk={lagreMottatteOpplysningerOgOppfriskSaksopplysninger}
          avbryt={skjulOppfriskModal}
          lukk={lukkOppfriskModal}
          tilForsiden={skjulOppfriskModalOgNavigerTilForside}
          behandlingOppfriskes={behandlingOppfriskes}
          annenBehandlingOppfriskes={annenBehandlingOppfriskes}
        />
      )}
      {visHenleggDialog && <DialogboksHenleggSak avbryt={skjulHenleggDialogHandle} henleggHandle={henleggHandle} />}
      {visAvslagSoknadDialog && (
        <DialogboksAvslagSoknad avbryt={skjulAvslagSoknadDialogHandle} avslaaSoknadHandle={avslaaSoknadHandle} />
      )}
      {visAvsluttSakSomBortfaltDialog && (
        <DialogboksAvsluttSakSomBortfalt
          avbryt={skjulAvsluttSakSomBortfaltDialogHandle}
          avsluttSakSomBortfalt={avsluttSakSomBortfalt}
        />
      )}
      {visBekreftValgDialog && (
        <DialogboksBekreftValg
          tittel={bekreftValgTypeData.tittel}
          tekst={bekreftValgTypeData.tekst}
          avbrytCallback={skjulBekreftValgDialogHandle}
          bekreftCallback={bekreftValgTypeData.bekreftCallback}
        />
      )}
    </Fragment>
  );
};

Modals.propTypes = {
  skjulOppfriskModalOgNavigerTilForside: PT.func.isRequired,
  visOppfriskDialog: PT.bool.isRequired,
  lagreMottatteOpplysningerOgOppfriskSaksopplysninger: PT.func.isRequired,
  skjulOppfriskModal: PT.func.isRequired,
  lukkOppfriskModal: PT.func.isRequired,
  visHenleggDialog: PT.bool.isRequired,
  skjulHenleggDialogHandle: PT.func.isRequired,
  henleggHandle: PT.func.isRequired,
  visAvslagSoknadDialog: PT.bool.isRequired,
  skjulAvslagSoknadDialogHandle: PT.func.isRequired,
  avslaaSoknadHandle: PT.func.isRequired,
  visAvsluttSakSomBortfaltDialog: PT.bool.isRequired,
  skjulAvsluttSakSomBortfaltDialogHandle: PT.func.isRequired,
  avsluttSakSomBortfalt: PT.func.isRequired,
  visBekreftValgDialog: PT.bool.isRequired,
  skjulBekreftValgDialogHandle: PT.func.isRequired,
  ferdigbehandleSak: PT.func.isRequired,
  behandlingOppfriskes: PT.bool.isRequired,
  annenBehandlingOppfriskes: PT.bool.isRequired,
  bekreftValgType: PT.oneOfType([PT.string, PT.number]),
  behandlingID: PT.number.isRequired,
  behandlingstema: PT.string.isRequired,
  sakstype: PT.string.isRequired,
};
Modals.defaultProps = {
  bekreftValgType: "",
};

const mapStateToProps = (state) => ({
  visOppfriskDialog: modalerSelectors.ErOppfriskSynligSelector(state),
  visHenleggDialog: modalerSelectors.ErHenleggSynligSelector(state),
  visAvslagSoknadDialog: modalerSelectors.ErAvslagSoknadSynligSelector(state),
  visAvsluttSakSomBortfaltDialog: modalerSelectors.ErAvsluttSakSomBortfaltSynligSelector(state),
  visBekreftValgDialog: modalerSelectors.ErBekreftValgSynligSelector(state),
  bekreftValgType: modalerSelectors.BekreftValgTypeSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  sakstype: fagsakSelectors.SakstypeKodeSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  skjulOppfriskModal: () => dispatch(modalerOperations.skjulOppfrisk()),
  lukkOppfriskModal: () =>
    dispatch(modalerOperations.skjulOppfrisk()) && dispatch(modalerOperations.fjernBehandlingOppfriskes()),
  skjulHenleggDialogHandle: () => dispatch(modalerOperations.skjulHenlegg()),
  skjulAvslagSoknadDialogHandle: () => dispatch(modalerOperations.skjulAvslagSoknad()),
  skjulAvsluttSakSomBortfaltDialogHandle: () => dispatch(modalerOperations.skjulAvsluttSakSomBortfalt()),
  skjulBekreftValgDialogHandle: () => dispatch(modalerOperations.skjulFerdigbehandleSak()),
});

const ConnectedModals = connect(mapStateToProps, mapDispatchToProps)(Modals);

export default () => (
  <FellesHandlersContext.Consumer>
    {(fellesHandlers) => <ConnectedModals {...fellesHandlers} />}
  </FellesHandlersContext.Consumer>
);
