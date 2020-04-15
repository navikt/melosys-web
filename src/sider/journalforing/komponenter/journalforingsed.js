import React from 'react';
import PT from 'prop-types';
import { reduxForm, getFormValues } from 'redux-form';
import { connect } from 'react-redux';

import * as Nav from '../../../utils/navFrontend';
import * as Validering from '../../../felleskomponenter/skjema/validering';
import * as MPT from '../../../proptypes';
import * as KV from '../../../kodeverk';
import * as Ikoner from '../../../resources/images';
import * as Mui from '../../../felleskomponenter/ui';

import Brukernavnskjema from '../../../felleskomponenter/brukernavnskjema';
import Fotknapper from './fotknapper';

import { journalforingSelectors } from '../../../ducks/journalforing';

import './journalforingsed.css';

const JournalforingSED = ({
  avsenderID,
  avsenderNavn,
  sakstype,
  behandlingstema,
  form,
  kanSubmittes,
  avbrytJournalforing,
  handleSubmit,
}) => (
  <form onSubmit={handleSubmit}>
    <Mui.Undertittel tekst="Informasjon om bruker" ikon={Ikoner.AccountCircle} className="undertittel oversteUndertittel" />
    <Nav.Row>
      <Nav.Column xs="6">
        <Brukernavnskjema form={form} />
      </Nav.Column>
    </Nav.Row>
    <Mui.Undertittel tekst="Informasjon om avsender" ikon={Ikoner.Globe} className="undertittel" />
    <Nav.Row>
      <Nav.Column xs="6">
        <Nav.typo.Element>Avsender ID</Nav.typo.Element>
        <Nav.typo.Normaltekst>{avsenderID}</Nav.typo.Normaltekst>
        <Nav.typo.Element>Avsenders navn</Nav.typo.Element>
        <Nav.typo.Normaltekst>{avsenderNavn}</Nav.typo.Normaltekst>
      </Nav.Column>
    </Nav.Row>
    <Mui.Undertittel tekst="Saksinformasjon" ikon={Ikoner.ParagraphTwoColumns} className="undertittel" />
    <Nav.Row>
      <Nav.Column xs="5">
        <Nav.typo.Element>Sakstype</Nav.typo.Element>
        <Nav.typo.Normaltekst>{sakstype.term}</Nav.typo.Normaltekst>
      </Nav.Column>
      <Nav.Column xs="7">
        <Nav.typo.Element>Behandlingstema</Nav.typo.Element>
        <Nav.typo.Normaltekst>{behandlingstema.term}</Nav.typo.Normaltekst>
      </Nav.Column>
    </Nav.Row>
    <Fotknapper kanSubmittes={kanSubmittes} avbrytJournalforing={avbrytJournalforing} />
  </form>
);

JournalforingSED.propTypes = {
  avsenderNavn: PT.string.isRequired,
  avsenderID: PT.string.isRequired,
  sakstype: MPT.Kodeverk.isRequired,
  behandlingstema: MPT.Kodeverk.isRequired,
  form: PT.string.isRequired,
  submitJournalforing: PT.func.isRequired,
  avbrytJournalforing: PT.func.isRequired,
  kanSubmittes: PT.bool.isRequired,
  handleSubmit: PT.func.isRequired,
};

const form = {
  form: KV.Form.JOURNALFORING_SED,
  enableReinitialize: true,
  destroyOnUnmount: true,
  updateUnregisteredFields: true,
  validate: Validering.Skjemaer.lagYupToReduxformErrorMapper(Validering.Skjemaer.journalforingSED),
};

const mapStateToProps = state => ({
  onSubmit: (values, dispatch, props) => props.submitJournalforing(),
  formValues: getFormValues(KV.Form.JOURNALFORING_SED)(state),
  initialValues: {
    submittable: true,
    brukerID: journalforingSelectors.BrukerIDSelector(state),
  },
});


export default connect(mapStateToProps)(reduxForm(form)(JournalforingSED));
