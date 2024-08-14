import { useEffect, useState } from "react";
import PT from "prop-types";
import { connect } from "react-redux";
import { change, getFormValues, reduxForm } from "redux-form";
import * as Api from "../../../../services/api";

import MKV, { MKVUtils } from "../../../../melosyskodeverk";
import * as Ikoner from "../../../../resources/images";
import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Nav from "../../../../navFrontend";
import * as MPT from "../../../../proptypes";

import { landkoderSelectors } from "../../../../ducks/landkoder";
import { journalforingSelectors } from "../../../../ducks/journalforing";
import { formSelectors } from "../../../../ducks/form";
import { sokSelectors } from "../../../../ducks/sok";

import Informasjon from "./informasjon";
import FagsakVelger from "../fagsakVelger";
import SendForvaltningsMelding from "../sendForvaltningsMelding";
import Komponent, { KomponentUtenOverskrift } from "../komponent";

import Fotknapper from "../fotknapper";
import { lagYupToReduxformErrorMapper } from "../../../../yup";
import JournalforingSchema from "../journalforingSchema";
import "./journalforingform.css";

const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;
const { ANNEN_PERSON_ELLER_VIRKSOMHET } = KV.AvsenderTyper;

const skalViseForvaltningsmelding = (formValues, fagsakListe) => {
  const { saksnummer, journalforingGjelder, sakstema, opprettnysak_behandlingstype, behandlingstype } = formValues;
  if (saksnummer === "-1") {
    // Opprett ny sak
    return (
      journalforingGjelder === BRUKER &&
      sakstema === MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG &&
      (opprettnysak_behandlingstype === MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG ||
        opprettnysak_behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING)
    );
  }
  if (saksnummer && !Utils._isEmpty(fagsakListe)) {
    // Eksisterende sak
    const valgtFagsak = fagsakListe.find((sak) => sak.saksnummer === saksnummer);
    return (
      journalforingGjelder === BRUKER &&
      valgtFagsak?.sakstema?.kode === MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG &&
      behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING
    );
  }
  return false;
};

const JournalforingForm = ({
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
  avsenderIDFraJournalpost,
  avsenderNavnFraJournalpost,
  mottaksKanalErEessi,
  mottaksKanalErElektronisk,
}) => {
  const visForvaltningsmelding = skalViseForvaltningsmelding(formValues, fagsakListe);
  const visFagsakVelger = formValues?.brukerNavn || formValues?.virksomhetNavn;
  const visSkalTilordnes = !fagsakListe.find(
    (sak) =>
      sak.saksnummer === formValues?.saksnummer &&
      MKVUtils.erOpphørtEllerHenlagtEllerBortfaltEllerAnnullert(sak.saksstatus.kode)
  );
  const [harRegistrertAdresse, setHarRegistrertAdresse] = useState(undefined);

  const { brukerID, avsenderType, avsenderID, forvaltningsmeldingMottaker } = formValues;

  const sjekkAdresse = () => {
    if (!visForvaltningsmelding || !avsenderType || (!brukerID && !avsenderID)) return;

    if (brukerID === null) {
      return;
    }

    let brukerIDPerson = "";
    let orgnr = "";

    const gyldigBrukerFnrEllerDnr = Utils.person.erGyldigFnrEllerDnr(brukerID);
    if (
      avsenderType === ANNEN_PERSON_ELLER_VIRKSOMHET &&
      forvaltningsmeldingMottaker === MKV.Koder.forvaltningsmeldingMottaker.AVSENDER
    ) {
      const avsenderErGyldigFnrDnr = Utils.person.erGyldigFnrEllerDnr(avsenderID);
      const avsenderErGyldigOrgNr = Utils.organisasjon.erOrgnrGyldig(avsenderID);

      if (avsenderErGyldigFnrDnr) {
        brukerIDPerson = avsenderID;
      } else if (avsenderErGyldigOrgNr) {
        orgnr = avsenderID;
      } else {
        return;
      }
    } else if (gyldigBrukerFnrEllerDnr) {
      brukerIDPerson = brukerID;
    } else {
      return;
    }

    Api.Kontroll.kontrollerAdresse({
      brukerID: brukerIDPerson,
      orgnr,
    })
      .then((res) => {
        const adresseFunnet = !(res.kontrollfeilList && res.kontrollfeilList.length > 0);
        setHarRegistrertAdresse(adresseFunnet);
      })
      .catch(() => setHarRegistrertAdresse(false));
  };

  useEffect(() => {
    sjekkAdresse();
  }, [brukerID, avsenderType, avsenderID, forvaltningsmeldingMottaker]);

  return (
    <form onSubmit={handleSubmit} className="journalforingform">
      <Informasjon
        journalpostID={journalpostID}
        dokumentID={hoveddokumentID}
        vedlegg={vedlegg}
        avsenderIDFraJournalpost={avsenderIDFraJournalpost}
        avsenderNavnFraJournalpost={avsenderNavnFraJournalpost}
        mottaksKanalErEessi={mottaksKanalErEessi}
        mottaksKanalErElektronisk={mottaksKanalErElektronisk}
      />

      {visFagsakVelger && (
        <Komponent
          ikon={Ikoner.Links}
          tittel="Knytt til eksisterende sak eller opprett ny sak"
          innhold={
            <FagsakVelger
              erJournalføring
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
              avsenderType={avsenderType}
              settFeltInnhold={settFeltInnhold}
              harRegistrertAdresse={harRegistrertAdresse}
            />
          }
        />
      )}

      <KomponentUtenOverskrift
        innhold={
          <>
            {visSkalTilordnes && <Skjema.Checkbox feltNavn="skalTilordnes" label="Legg behandlingen i mine oppgaver" />}
            {submitFailed && !Utils.object.isDeepEmpty(formErrors) && (
              <Nav.Alert variant="error" className="feilmelding">
                {Utils.feilmelding.syncErrorsTilFeilmelding(formErrors)}
              </Nav.Alert>
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
  fagsakListe: PT.array,
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
  avsenderIDFraJournalpost: PT.string,
  avsenderNavnFraJournalpost: PT.string,
  mottaksKanalErEessi: PT.bool.isRequired,
  mottaksKanalErElektronisk: PT.bool.isRequired,
};

JournalforingForm.defaultProps = {
  formValues: {},
  formErrors: {},
  hoveddokumentID: "",
  fagsakListe: [],
  avsenderIDFraJournalpost: "",
  avsenderNavnFraJournalpost: "",
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
    mottattDato: Utils.dato.formatterDatoTilNorsk(journalforingSelectors.MottattDatoSelector(state)),
    hoveddokument: {
      tittel: journalforingSelectors.JournalforingHovedDokumentTittelSelector(state) || "Uten tittel",
      logiskeVedlegg: journalforingSelectors.JournalforingLogiskeVedleggSelector(state),
    },
    vedlegg: {
      pdf: toVedleggMedProps(journalforingSelectors.JournalforingVedleggsDokumenter(state)),
    },
    journalforingSoknadsland: [],
    journalforingSoknadslandFlereLandUkjentHvilke: false,
    skalTilordnes: false,
    submittable: false,
    forvaltningsmeldingMottaker: null,
  },
  fagsakListe: sokSelectors.FagsakSokSelector(state),
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
        mottaksKanalErEessi: props.mottaksKanalErEessi,
        registeredFields: props.registeredFields,
        journalforingKnappErTryktPå: Boolean(values.journalforingHensikt),
      },
    };

    return lagYupToReduxformErrorMapper(JournalforingSchema, options)(values);
  },
};

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm(form)(JournalforingForm));
