import React, { Fragment } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, getFormValues, change } from 'redux-form';
import * as MKV from 'melosys-kodeverk';

import * as Ikoner from '../../../resources/images';
import * as KV from '../../../kodeverk';
import * as Validering from '../../../felleskomponenter/skjema/validering';
import * as Utils from '../../../utils';
import * as MPT from '../../../proptypes';
import * as Skjema from '../../../felleskomponenter/skjema';
import * as Mui from '../../../felleskomponenter/ui';

import { BOOLSK } from '../../../constants';
import { journalforingSelectors } from '../../../ducks/journalforing';
import Informasjon from '../komponenter/informasjon';
import FagsakVelger from './fagsakVelger';
import SendForvaltningsMelding from './sendForvaltningsMelding';
import Fotknapper from './fotknapper';

const JournalforingForm = props => {
  const {
    journalpostID,
    hoveddokumentID,
    vedlegg,
    hentOgVisAvsender,
    hentOgVisBruker,
    fagsakListe,
    hentOgVisRepresentant,
    behandlingstyper,
    formValues,
    settJournalforingHensikt,
    avbrytJournalforing,
    kanSubmittes,
    handleSubmit,
  } = props;
  const visForvaltningsMelding = formValues.saksnummer === '-1' && formValues.opprettnysak_behandlingstype === MKV.Koder.behandlinger.behandlingstyper.SOEKNAD;

  return (
    <form onSubmit={handleSubmit}>
      <Informasjon
        journalpostID={journalpostID}
        dokumentID={hoveddokumentID}
        vedlegg={vedlegg}
        hentOgVisAvsender={hentOgVisAvsender}
        hentOgVisBruker={hentOgVisBruker}
        hentOgVisRepresentant={hentOgVisRepresentant}
      />
      <Mui.Undertittel tekst="Knytt til brukers eksisterende sak eller opprett ny sak" ikon={Ikoner.CheckList} className="undertittel oversteUndertittel" />
      <FagsakVelger
        sakstyper={MKV.KTObjects.sakstyper}
        behandlingstyper={behandlingstyper}
        fagsakListe={fagsakListe}
        settJournalforingHensikt={settJournalforingHensikt}
      />
      {
        visForvaltningsMelding &&
        <Fragment>
          <Mui.Undertittel tekst="Melding om saksbehandlingstid" ikon={Ikoner.PaperPlane} className="undertittel oversteUndertittel" />
          <SendForvaltningsMelding />
        </Fragment>
      }
      <Skjema.Checkbox feltNavn="skalTilordnes" label="Legg til behandlingen i mine oppgaver" />
      <Fotknapper kanSubmittes={kanSubmittes} avbrytJournalforing={avbrytJournalforing} />
    </form>
  );
};

JournalforingForm.propTypes = {
  journalpostID: PT.string.isRequired,
  hoveddokumentID: PT.string,
  vedlegg: PT.array.isRequired,
  hentOgVisAvsender: PT.func.isRequired,
  hentOgVisBruker: PT.func.isRequired,
  fagsakListe: PT.array.isRequired,
  hentOgVisRepresentant: PT.func.isRequired,
  formValues: PT.object,
  settJournalforingHensikt: PT.func.isRequired,
  behandlingstyper: PT.arrayOf(MPT.Kodeverk).isRequired,
  submitJournalforing: PT.func.isRequired,
  avbrytJournalforing: PT.func.isRequired,
  kanSubmittes: PT.bool.isRequired,
  handleSubmit: PT.func.isRequired,
};

JournalforingForm.defaultProps = {
  formValues: {},
  hoveddokumentID: '',
};

const toVedleggMedProps = vedlegg => vedlegg.reduce((acc, d, index) => { acc[`tittel_${index}`] = d.tittel; return acc; }, {});
const mapStateToProps = state => ({
  erAvsenderPreutfylt: journalforingSelectors.ErAvsenderPreutfyltSelector(state),
  formValues: getFormValues(KV.Form.JOURNALFORING)(state),
  initialValues: {
    avsenderType: journalforingSelectors.AvsenderTypeSelector(state), // ["string", "null"]
    behandlingstype: null,
    saksnummer: '',
    brukerID: journalforingSelectors.BrukerIDSelector(state),
    erBrukerAvsender: journalforingSelectors.ErBrukerAvsenderSelector(state),
    avsenderID: journalforingSelectors.AvsenderIDSelector(state),
    avsenderNavn: journalforingSelectors.AvsenderNavnSelector(state),
    arbeidsgiverID: null,
    representantID: '',
    representantRepresenterer: '',
    mottattDato: Utils.dato.formatterDatoTilNorsk(journalforingSelectors.MottattDatoSelector(state)),
    hoveddokumentTittel: journalforingSelectors.JournalforingHovedDokumentTittelSelector(state) || 'Uten tittel',
    vedlegg: {
      pdf: toVedleggMedProps(journalforingSelectors.JournalforingVedleggsDokumenter(state)),
      logiskeTitler: [],
    },
    sakstype: MKV.Koder.sakstyper.EU_EOS,
    opprettBehandling: BOOLSK.USANN,
    opprettnysak_behandlingstype: MKV.Koder.behandlinger.behandlingstyper.SOEKNAD,
    ingenVurdering: false,
    ikkeSendForvaltingsmelding: false,
    skalTilordnes: false,
    journalforingUnntakFraLovvalgsland: MKV.Koder.landkoder.NO,
    journalforingLovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1,
    submittable: false,
  },
});

const mapDispatchToProps = dispatch => ({
  settJournalforingHensikt: journalforingHensikt => dispatch(change(KV.Form.JOURNALFORING, 'journalforingHensikt', journalforingHensikt)),
});

const form = {
  onSubmit: (values, dispatch, props) => props.submitJournalforing(),
  form: KV.Form.JOURNALFORING,
  enableReinitialize: true,
  destroyOnUnmount: true,
  updateUnregisteredFields: true,
  touchOnChange: true,
  validate: (values, props) => {
    const options = {
      context: {
        brukerNavn: props.formValues ? props.formValues.brukerNavn : undefined,
        erAvsenderPreutfylt: props.erAvsenderPreutfylt,
      },
    };

    return Validering.Skjemaer.lagYupToReduxformErrorMapper(Validering.Skjemaer.journalforing, options)(values);
  },
};

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm(form)(JournalforingForm));
