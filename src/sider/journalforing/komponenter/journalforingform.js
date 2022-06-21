import React, { Fragment } from "react";
import PT from "prop-types";
import { connect } from "react-redux";
import { reduxForm, getFormValues, change } from "redux-form";

import * as Ikoner from "../../../resources/images";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../../felleskomponenter/ui";

import MKV, { Utils as MKVUtils } from "../../../melosyskodeverk";
import { journalforingSelectors } from "../../../ducks/journalforing";
import { formSelectors } from "../../../ducks/form";
import Informasjon from "./informasjon";
import FagsakVelger from "./fagsakVelger";
import SendForvaltningsMelding from "./sendForvaltningsMelding";
import Fotknapper from "./fotknapper";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import JournalforingSchema from "./journalforingSchema";
import "./journalforingform.css";

export const BRUKER = "Bruker";
export const VIRKSOMHET = "Virksomhet";

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
  } = props;
  const visForvaltningsMelding =
    formValues.saksnummer === "-1" &&
    (MKVUtils.erSoknad(formValues.opprettnysak_behandlingstema) ||
      [
        MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET,
        MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV,
      ].includes(formValues.opprettnysak_behandlingstema)) &&
    formValues.journalforingGjelder === BRUKER;

  return (
    <form onSubmit={handleSubmit} className="journalforingform">
      <Informasjon journalpostID={journalpostID} dokumentID={hoveddokumentID} vedlegg={vedlegg} />
      <Mui.Undertittel
        tekst="Knytt til eksisterende sak eller opprett ny sak"
        ikon={Ikoner.CheckList}
        className="undertittel oversteUndertittel"
      />
      <FagsakVelger fagsakListe={fagsakListe} settJournalforingHensikt={settJournalforingHensikt} />
      {visForvaltningsMelding && (
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
const mapStateToProps = (state) => ({
  erAvsenderPreutfylt: journalforingSelectors.ErAvsenderPreutfyltSelector(state),
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
    sakstype: MKV.Koder.sakstyper.EU_EOS,
    opprettBehandling: false,
    opprettnysak_behandlingstema: MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
    ingenVurdering: false,
    ikkeSendForvaltingsmelding: false,
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
      },
    };

    return lagYupToReduxformErrorMapper(JournalforingSchema, options)(values);
  },
};

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm(form)(JournalforingForm));
