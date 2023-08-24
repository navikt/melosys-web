import { useEffect, useState } from "react";
import PT from "prop-types";
import { connect } from "react-redux";
import { change, getFormValues, reduxForm } from "redux-form";
import * as Api from "../../../services/api";

import MKV, { MKVUtils } from "../../../melosyskodeverk";
import * as Ikoner from "../../../resources/images";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Nav from "../../../navFrontend";
import * as MPT from "../../../proptypes";

import { landkoderSelectors } from "../../../ducks/landkoder";
import { journalforingSelectors } from "../../../ducks/journalforing";
import { formSelectors } from "../../../ducks/form";

import Informasjon from "./informasjon";
import FagsakVelger from "./fagsakVelger";
import SendForvaltningsMelding from "./sendForvaltningsMelding";
import Komponent, { KomponentUtenOverskrift } from "./komponent";
import Fotknapper from "./fotknapper";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import JournalforingSchema from "./journalforingSchema";
import "./journalforingform.css";

const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;

const skalViseForvaltningsmelding = (formValues) =>
  formValues.saksnummer === "-1" &&
  formValues.journalforingGjelder === BRUKER &&
  formValues.sakstema === MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG &&
  formValues.opprettnysak_behandlingstype === MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG;

export const JournalforingForm = ({
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
  handleSubmit,
  landkoder,
}) => {
  const visForvaltningsmelding = skalViseForvaltningsmelding(formValues);
  const visFagsakVelger = formValues?.brukerNavn || formValues?.virksomhetNavn;
  const visSkalTilordnes = !fagsakListe.find(
    (sak) => sak.saksnummer === formValues?.saksnummer && MKVUtils.erHenlagtEllerHenlagtBortfalt(sak.saksstatus.kode)
  );
  const [harRegistrertAdresse, setHarRegistrertAdresse] = useState(undefined);

  const { brukerID, avsenderType, representantID, representantRepresenterer } = formValues;

  useEffect(() => {
    settFeltInnhold("ikkeSendForvaltingsmelding", !visForvaltningsmelding);
  }, [visForvaltningsmelding]);

  useEffect(() => {
    if (!visForvaltningsmelding) return;
    if ((brukerID || representantID) && avsenderType) {
      const gyldigBrukerFnrEllerDnr = Utils.person.erGyldigFnrEllerDnr(brukerID);
      const gyldigFullmektigFnrEllerDnr = Utils.person.erGyldigFnrEllerDnr(representantID);
      const gyldigOrganisasjonsNummer = Utils.organisasjon.erOrgnrGyldig(representantID);
      const representererBruker = [MKV.Koder.representerer.BRUKER, MKV.Koder.representerer.BEGGE].includes(
        representantRepresenterer
      );
      let brukerIDPerson = "";
      let orgnr = "";

      if (avsenderType === KV.AvsenderTyper.PERSON && gyldigBrukerFnrEllerDnr) {
        brukerIDPerson = brukerID;
      } else if (
        avsenderType === KV.AvsenderTyper.FULLMEKTIG &&
        (gyldigFullmektigFnrEllerDnr || gyldigOrganisasjonsNummer)
      ) {
        if (gyldigFullmektigFnrEllerDnr) brukerIDPerson = representantID;
        if (gyldigOrganisasjonsNummer && representererBruker) orgnr = representantID;
        if (gyldigOrganisasjonsNummer && !representererBruker) brukerIDPerson = brukerID;
      } else {
        return;
      }

      Api.Kontroll.kontrollerAdresse({
        brukerID: brukerIDPerson,
        orgnr,
      })
        .then((res) => {
          const harRegistrertAdresse = !(res.kontrollfeilList && res.kontrollfeilList.length > 0);
          setHarRegistrertAdresse(harRegistrertAdresse);
          settFeltInnhold("ikkeSendForvaltingsmelding", !harRegistrertAdresse);
        })
        .catch(() => setHarRegistrertAdresse(false));
    }
  }, [brukerID, avsenderType, representantID, representantRepresenterer, visForvaltningsmelding]);

  return (
    <form onSubmit={handleSubmit} className="journalforingform">
      <Informasjon journalpostID={journalpostID} dokumentID={hoveddokumentID} vedlegg={vedlegg} />

      {visFagsakVelger && (
        <Komponent
          ikon={Ikoner.Links}
          tittel="Knytt til eksisterende sak eller opprett ny sak"
          innhold={
            <FagsakVelger
              fagsakListe={fagsakListe}
              settJournalforingHensikt={settJournalforingHensikt}
              landkoder={landkoder}
              formValues={formValues}
            />
          }
        />
      )}

      {visForvaltningsmelding && (
        <Komponent
          ikon={Ikoner.Hourglass}
          tittel="Melding om saksbehandlingstid"
          innhold={
            <SendForvaltningsMelding
              avsenderType={formValues.avsenderType}
              settFeltInnhold={settFeltInnhold}
              harRegistrertAdresse={harRegistrertAdresse}
              representantRepresenterer={formValues.representantRepresenterer}
            />
          }
        />
      )}

      <KomponentUtenOverskrift
        innhold={
          <>
            {visSkalTilordnes && <Skjema.Checkbox feltNavn="skalTilordnes" label="Legg behandlingen i mine oppgaver" />}
            {submitFailed && !Utils.object.isDeepEmpty(formErrors) && (
              <Nav.AlertStripeFeil className="feilmelding">
                {Utils.feilmelding.syncErrorsTilFeilmelding(formErrors)}
              </Nav.AlertStripeFeil>
            )}
            <Fotknapper avbrytJournalforing={avbrytJournalforing} spinner={submitSpinner} />
          </>
        }
      />
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
  handleSubmit: PT.func.isRequired,
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

const mapStateToProps = (state) => ({
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
        registeredFields: props.registeredFields,
        journalforingKnappErTryktPå: Boolean(values.journalforingHensikt),
      },
    };

    return lagYupToReduxformErrorMapper(JournalforingSchema, options)(values);
  },
};

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm(form)(JournalforingForm));
