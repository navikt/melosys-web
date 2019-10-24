import React, { useState } from 'react';
import PT from 'prop-types';
import { reduxForm, getFormValues, change } from 'redux-form';
import { connect } from 'react-redux';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../../felleskomponenter/skjema';
import * as Validering from '../../../felleskomponenter/skjema/validering';
import * as Api from '../../../services/api';
import * as Utils from '../../../utils';
import * as MPT from '../../../proptypes';
import * as KV from '../../../kodeverk';
import * as Ikoner from '../../../resources/images';

import './journalforingsed.css';

const Overskrift = ({
  ikon,
  tekst,
  className,
}) => (
  <Nav.Undertittel className={className}>
    <img src={ikon} height={25} alt={tekst} />{tekst}
  </Nav.Undertittel>
);

Overskrift.propTypes = {
  ikon: PT.any.isRequired,
  tekst: PT.string.isRequired,
  className: PT.string,
};

Overskrift.defaultProps = {
  className: undefined,
};

const JournalforingSED = ({
  avsenderID,
  avsenderNavn,
  sakstype,
  behandlingstype,
  formValues,
  settFormBruker,
}) => {
  const [brukerSpinner, setBrukerSpinner] = useState(false);

  const hentBruker = async fnrdnr => {
    setBrukerSpinner(true);

    try {
      const brukerRespons = await Api.Personer.hentPerson(fnrdnr);
      settFormBruker(brukerRespons);
    } catch (e) {
      settFormBruker('');
      Utils.logger.error(e);
    } finally {
      setBrukerSpinner(false);
    }
  };

  const vedBlur = () => {
    hentBruker(formValues.brukerID);
  };

  const { bruker = {} } = formValues;
  const { sammensattNavn = '' } = bruker;

  return (
    <form>
      <Overskrift tekst="Informasjon om bruker" ikon={Ikoner.AccountCircle} className="undertittel oversteUndertittel" />
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Input onBlur={vedBlur} className="fetTekst" label="Brukers f.nr eller d.nr" feltNavn="brukerID" />
          <Nav.Element>Brukers fulle navn</Nav.Element>
          <Nav.Normaltekst>
            { brukerSpinner && <Nav.NavFrontendSpinner /> }
            { sammensattNavn }
          </Nav.Normaltekst>
        </Nav.Column>
      </Nav.Row>
      <Overskrift tekst="Informasjon om avsender" ikon={Ikoner.Globe} className="undertittel" />
      <Nav.Row>
        <Nav.Column xs="6">
          <Nav.Element>Avsender ID</Nav.Element>
          <Nav.Normaltekst>{avsenderID}</Nav.Normaltekst>
          <Nav.Element>Avsenders navn</Nav.Element>
          <Nav.Normaltekst>{avsenderNavn}</Nav.Normaltekst>
        </Nav.Column>
      </Nav.Row>
      <Overskrift tekst="Saksinformasjon" ikon={Ikoner.ParagraphTwoColumns} className="undertittel" />
      <Nav.Row>
        <Nav.Column xs="5">
          <Nav.Element>Sakstype</Nav.Element>
          <Nav.Normaltekst>{sakstype.term}</Nav.Normaltekst>
        </Nav.Column>
        <Nav.Column xs="7">
          <Nav.Element>Behandlingstype</Nav.Element>
          <Nav.Normaltekst>{behandlingstype.term}</Nav.Normaltekst>
        </Nav.Column>
      </Nav.Row>
    </form>
  );
};

JournalforingSED.propTypes = {
  avsenderNavn: PT.string.isRequired,
  avsenderID: PT.string.isRequired,
  sakstype: MPT.Kodeverk.isRequired,
  behandlingstype: MPT.Kodeverk.isRequired,
  formValues: PT.object,
  settFormBruker: PT.func.isRequired,
};

JournalforingSED.defaultProps = {
  formValues: {},
};

const form = {
  form: KV.Form.JOURNALFORING_SED,
  enableReinitialize: true,
  destroyOnUnmount: true,
  updateUnregisteredFields: true,
  validate: Validering.Skjemaer.lagYupToReduxformErrorMapper(Validering.Skjemaer.journalforingSED),
};

const mapStateToProps = state => ({
  formValues: getFormValues(KV.Form.JOURNALFORING_SED)(state),
});

const mapDispatchToProps = dispatch => ({
  settFormBruker: brukerNavn => dispatch(change(KV.Form.JOURNALFORING_SED, 'bruker', brukerNavn)),
});

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm(form)(JournalforingSED));
