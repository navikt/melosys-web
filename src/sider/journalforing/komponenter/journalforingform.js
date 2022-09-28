import React, { Fragment, useEffect } from "react";
import PT from "prop-types";
import { connect } from "react-redux";
import { change, getFormValues, reduxForm } from "redux-form";

import MKV, { MKVUtils } from "../../../melosyskodeverk";
import * as Ikoner from "../../../resources/images";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../../felleskomponenter/ui";
import * as MPT from "../../../proptypes";

import { landkoderSelectors } from "../../../ducks/landkoder";
import { journalforingSelectors } from "../../../ducks/journalforing";
import { formSelectors } from "../../../ducks/form";

import Informasjon from "./informasjon";
import FagsakVelger from "./fagsakVelger";
import SendForvaltningsMelding from "./sendForvaltningsMelding";
import Fotknapper from "./fotknapper";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import JournalforingSchema from "./journalforingSchema";
import "./journalforingform.css";

const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;

const skalViseForvaltningsmelding = (formValues, toggleEnabled) => {
  if (toggleEnabled) {
    return (
      formValues.saksnummer === "-1" &&
      formValues.journalforingGjelder === BRUKER &&
      formValues.sakstema === MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG &&
      formValues.opprettnysak_behandlingstype === MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG
    );
  }

  return (
    formValues.saksnummer === "-1" &&
    (MKVUtils.erSoknad(formValues.opprettnysak_behandlingstema) ||
      [
        MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET,
        MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV,
      ].includes(formValues.opprettnysak_behandlingstema)) &&
    formValues.journalforingGjelder === BRUKER
  );
};

export const JournalforingForm = (props) => {
  const {
    journalpostID,
    hoveddokumentID,
    vedlegg,
    fagsakListe,
    formValues,
    formErrors,
    submitFailed,
    settFeltInnhold,
    settJournalforingHensikt,
    avbrytJournalforing,
    submitSpinner,
    kanSubmittes,
    handleSubmit,
    behandleAlleSakerToggleEnabled,
    landkoder,
  } = props;

  const visForvaltningsmelding = skalViseForvaltningsmelding(formValues, behandleAlleSakerToggleEnabled);
  useEffect(() => {
    if (!visForvaltningsmelding) {
      settFeltInnhold("ikkeSendForvaltingsmelding", true);
    }
  }, [visForvaltningsmelding]);

  return (
    <form onSubmit={handleSubmit} className="journalforingform">
      <Informasjon journalpostID={journalpostID} dokumentID={hoveddokumentID} vedlegg={vedlegg} />
      <Mui.Undertittel
        tekst="Knytt til eksisterende sak eller opprett ny sak"
        ikon={Ikoner.CheckList}
        className="undertittel oversteUndertittel"
      />
      <FagsakVelger
        fagsakListe={fagsakListe}
        settJournalforingHensikt={settJournalforingHensikt}
        behandleAlleSakerToggleEnabled={behandleAlleSakerToggleEnabled}
        landkoder={landkoder}
      />
      {visForvaltningsmelding && (
        <Fragment>
          <Mui.Undertittel
            tekst="Melding om saksbehandlingstid"
            ikon={Ikoner.PaperPlane}
            className="undertittel oversteUndertittel"
          />
          <SendForvaltningsMelding avsenderType={formValues.avsenderType} settFeltInnhold={settFeltInnhold} />
        </Fragment>
      )}
      {submitFailed && !Utils._isEmpty(formErrors) && (
        <Nav.AlertStripeFeil className="feilmelding">
          {Utils.feilmelding.syncErrorsTilFeilmelding(formErrors)}
        </Nav.AlertStripeFeil>
      )}
      <Skjema.Checkbox feltNavn="skalTilordnes" label="Legg til behandlingen i mine oppgaver" />
      <Fotknapper kanSubmittes={kanSubmittes} avbrytJournalforing={avbrytJournalforing} spinner={submitSpinner} />
    </form>
  );
};

JournalforingForm.propTypes = {
  journalpostID: PT.string.isRequired,
  hoveddokumentID: PT.string,
  vedlegg: PT.array.isRequired,
  fagsakListe: PT.array.isRequired,
  formValues: PT.object,
  formErrors: PT.object,
  submitFailed: PT.bool.isRequired,
  settFeltInnhold: PT.func.isRequired,
  settJournalforingHensikt: PT.func.isRequired,
  submitSpinner: PT.bool.isRequired,
  submitJournalforing: PT.func.isRequired,
  avbrytJournalforing: PT.func.isRequired,
  kanSubmittes: PT.bool.isRequired,
  handleSubmit: PT.func.isRequired,
  behandleAlleSakerToggleEnabled: PT.bool.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
};

JournalforingForm.defaultProps = {
  formValues: {},
  formErrors: {},
  hoveddokumentID: "",
};

const toVedleggMedProps = (vedlegg) =>
  vedlegg.reduce((acc, d, index) => {
    acc[`tittel_${index}`] = d.tittel;
    return acc;
  }, {});
const mapStateToProps = (state, ownProps) => ({
  erAvsenderPreutfylt: journalforingSelectors.ErAvsenderPreutfyltSelector(state),
  landkoder: landkoderSelectors.LandkoderSelector(state),
  formValues: getFormValues(KV.Form.JOURNALFORING)(state),
  formErrors: formSelectors.JournalforingFormSelector(state).syncErrors || {},
  submitFailed: formSelectors.JournalforingFormSelector(state).submitFailed,
  initialValues: {
    avsenderType: journalforingSelectors.AvsenderTypeSelector(state),
    behandlingstype: null,
    saksnummer: "",
    journalforingGjelder: journalforingSelectors.VirksomhetOrgnrSelector(state) ? VIRKSOMHET : BRUKER,
    brukerID: journalforingSelectors.BrukerIDSelector(state),
    virksomhetOrgnr: journalforingSelectors.VirksomhetOrgnrSelector(state),
    erHovedpartAvsender: journalforingSelectors.ErHovedpartAvsenderSelector(state),
    avsenderID: journalforingSelectors.AvsenderIDSelector(state),
    avsenderNavn: journalforingSelectors.AvsenderNavnSelector(state),
    arbeidsgiverID: null,
    representantID: null,
    representantRepresenterer: null,
    mottattDato: Utils.dato.formatterDatoTilNorsk(journalforingSelectors.MottattDatoSelector(state)),
    hoveddokument: {
      tittel: journalforingSelectors.JournalforingHovedDokumentTittelSelector(state) || "Uten tittel",
      logiskeVedlegg: journalforingSelectors.JournalforingLogiskeVedleggSelector(state),
    },
    vedlegg: {
      pdf: toVedleggMedProps(journalforingSelectors.JournalforingVedleggsDokumenter(state)),
    },
    journalforingSoknadsland: [],
    journalforingSoknadslandUkjenteEllerAlleEosLand: false,
    sakstype: ownProps.behandleAlleSakerToggleEnabled ? null : MKV.Koder.sakstyper.EU_EOS,
    opprettBehandling: false,
    opprettnysak_behandlingstema: ownProps.behandleAlleSakerToggleEnabled
      ? null
      : MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
    ingenVurdering: false,
    ikkeSendForvaltingsmelding: true,
    skalTilordnes: false,
    submittable: false,
  },
});

const mapDispatchToProps = (dispatch) => ({
  settJournalforingHensikt: (journalforingHensikt) =>
    dispatch(change(KV.Form.JOURNALFORING, "journalforingHensikt", journalforingHensikt)),
});

const form = {
  onSubmit: (values, dispatch, props) => props.submitJournalforing(),
  form: KV.Form.JOURNALFORING,
  enableReinitialize: true,
  destroyOnUnmount: true,
  updateUnregisteredFields: true,
  validate: (values, props) => {
    const options = {
      context: {
        erAvsenderPreutfylt: props.erAvsenderPreutfylt,
        behandleAlleSakerToggleEnabled: props.behandleAlleSakerToggleEnabled,
      },
    };

    return lagYupToReduxformErrorMapper(JournalforingSchema, options)(values);
  },
};

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm(form)(JournalforingForm));
