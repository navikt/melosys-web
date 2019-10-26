import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, getFormValues } from 'redux-form';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../../../kodeverk';
import * as Validering from '../../../felleskomponenter/skjema/validering';
import * as Utils from '../../../utils';
import * as MPT from '../../../proptypes';

import Informasjon from '../komponenter/informasjon';
import EksisterendeSaker from '../komponenter/eksisterendeSaker';
import OpprettNyFagSak from '../komponenter/opprettnyfagsak';

import { journalforingSelectors } from '../../../ducks/journalforing';

const JournalforingForm = ({
  journalpostID,
  hoveddokumentID,
  hoveddokumentTittel,
  vedlegg,
  hentOgVisAvsender,
  hentOgVisBruker,
  fagsakListe,
  knyttTilEksisterendeSak,
  opprettFagsak,
  hentOgVisRepresentant,
  overstyrSubmit,
  behandlingstyper,
}) => (
  <form onSubmit={overstyrSubmit}>
    <Informasjon
      journalpostID={journalpostID}
      dokumentID={hoveddokumentID}
      dokumentTittel={hoveddokumentTittel}
      vedlegg={vedlegg}
      hentOgVisAvsender={hentOgVisAvsender}
      hentOgVisBruker={hentOgVisBruker}
    />
    <EksisterendeSaker
      behandlingstyper={behandlingstyper}
      fagsakListe={fagsakListe}
      knyttTilEksisterendeSak={knyttTilEksisterendeSak}
    />
    <OpprettNyFagSak
      sakstyper={MKV.KTObjects.sakstyper}
      behandlingstyper={behandlingstyper}
      opprettFagsak={opprettFagsak}
      hentOgVisRepresentant={hentOgVisRepresentant}
    />
  </form>
);

JournalforingForm.propTypes = {
  journalpostID: PT.string.isRequired,
  hoveddokumentID: PT.string,
  hoveddokumentTittel: PT.string.isRequired,
  vedlegg: PT.array.isRequired,
  hentOgVisAvsender: PT.func.isRequired,
  hentOgVisBruker: PT.func.isRequired,
  fagsakListe: PT.array.isRequired,
  knyttTilEksisterendeSak: PT.func.isRequired,
  opprettFagsak: PT.func.isRequired,
  hentOgVisRepresentant: PT.func.isRequired,
  formValues: PT.object,
  overstyrSubmit: PT.func.isRequired,
  behandlingstyper: PT.arrayOf(MPT.Kodeverk).isRequired,
};

JournalforingForm.defaultProps = {
  formValues: {},
  hoveddokumentID: '',
};

const toVedleggMedProps = vedlegg => vedlegg.reduce((acc, d, index) => { acc[`tittel_${index}`] = d.tittel; return acc; }, {});
const mapStateToProps = state => ({
  journalforingAvsenderID: journalforingSelectors.AvsenderIDSelector(state),
  journalforingAvsenderNavn: journalforingSelectors.AvsenderNavnSelector(state),
  formValues: getFormValues(KV.Form.JOURNALFORING)(state),
  initialValues: {
    behandlingstype: null,
    brukerID: journalforingSelectors.JournalforingAlle(state).brukerID,
    erBrukerAvsender: journalforingSelectors.JournalforingAlle(state).erBrukerAvsender,
    avsenderID: journalforingSelectors.JournalforingAlle(state).avsenderID,
    avsenderNavn: journalforingSelectors.JournalforingAlle(state).avsenderNavn,
    arbeidsgiverID: null,
    representantID: '',
    mottattDato: Utils.dato.formatterDatoTilNorsk(journalforingSelectors.JournalforingAlle(state).mottattDato),
    hoveddokumentTittel: journalforingSelectors.JournalforingHovedDokument(state).tittel,
    vedlegg: {
      pdf: toVedleggMedProps(journalforingSelectors.JournalforingVedleggsDokumenter(state)),
      logiskeTitler: [],
    },
    sakstype: MKV.Koder.sakstyper.EU_EOS,
    opprettnysak_behandlingstype: MKV.Koder.behandlinger.behandlingstyper.SOEKNAD,
    ingenVurdering: false,
    ikkeSendForvaltingsmelding: false,
    skalTilordnes: false,
    journalforingUnntakFraLovvalgsland: MKV.Koder.landkoder.NO,
    journalforingLovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1,
  },
});

const form = {
  form: KV.Form.JOURNALFORING,
  enableReinitialize: true,
  destroyOnUnmount: true,
  updateUnregisteredFields: true,
  touchOnChange: true,
  validate: (values, props) => {
    const erAvsenderIDOgAvsenderNavnPreutfylt = props.journalforingAvsenderID && props.journalforingAvsenderNavn;

    const options = {
      context: {
        brukerNavn: props.formValues ? props.formValues.brukerNavn : undefined,
        skalValidereAvsenderType: erAvsenderIDOgAvsenderNavnPreutfylt,
      },
    };

    return Validering.Skjemaer.lagYupToReduxformErrorMapper(Validering.Skjemaer.journalforing, options)(values);
  },
  onSubmit: () => {},
};

export default connect(mapStateToProps)(reduxForm(form)(JournalforingForm));
