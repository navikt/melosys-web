import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Skjema from './skjema';
import * as Ikoner from '../resources/images';

import { OrganisasjonSelector } from '../ducks/fagsaker';
import { ArbeidNorgeSelector } from '../ducks/soknad';
import { SoknadenFormSelector } from '../ducks/form';

import PanelHeader from './panelHeader/panelHeader';
import Forretningsadresse from './adresser/forretningsadresse';
import Postadresse from './adresser/postadresse';

import './utsendendeArbeidsgiver.css';

const Arbeidsgiver = ({ arbeidsgiver }) => {
  const { orgnr, navn, forretningsadresse, postadresse } = arbeidsgiver;
  const postAdresseKomp = postadresse ? <div><dt>Postdresse</dt><dd><Postadresse postadresse={postadresse} /></dd></div> : null;
  const forretningsadresseKomp = forretningsadresse ? <div><dt>Forretningsadresse</dt><dd><Forretningsadresse forretningsadresse={forretningsadresse} /></dd></div> : null;

  return arbeidsgiver ? (
    <dl className="arbeidsgiver__detaljer">
      <dt>Navn</dt>
      <dd>{ navn } </dd>
      <dt>Orgnr / IDnr</dt>
      <dd>{ orgnr } </dd>
      <dt>Opprettet dato</dt>
      <dd>(mangler fra backend)</dd>
      <dt>Organisasjonsform</dt>
      <dd>(mangler fra backend)</dd>
      {postAdresseKomp}
      {forretningsadresseKomp}
    </dl>
  ) : null;
};

Arbeidsgiver.propTypes = {
  arbeidsgiver: MPT.Organisasjon,
};

Arbeidsgiver.defaultProps = {
  arbeidsgiver: null,
};

function UtsendendeArbeidsgiver (props) {
  const { organisasjoner, utsendendeOrgnr, soknadArbeidNorge } = props;
  const arbeidsgiver = organisasjoner ? organisasjoner.find(item => item.orgnr === utsendendeOrgnr) : {};

  return Object.keys(soknadArbeidNorge) > 0 ? (
    <div className="utsendendeArbeidsgiver panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={Ikoner.Ferdig} tittel="Utsendende arbeidsgiver" undertittel="" />}
        ariaTittel="Panel for utsendende arbeidsgiver i Norge">
        <Nav.Container fluid>
          <Nav.Row className="arbeidsgiver__seksjon">
            <Nav.Column xs="6">
              {arbeidsgiver && <Arbeidsgiver arbeidsgiver={arbeidsgiver} /> }
            </Nav.Column>
            <Nav.Column xs="6">
              <dl className="arbeidsgiver__detaljer">
                <Skjema.Input label="Kontaktperson" feltNavn="kontaktNavn" />
                <Skjema.Input label="Telefon" feltNavn="kontaktTelefon" />
                <Skjema.Input label="E-post" feltNavn="kontaktEpost" />
                <Skjema.Input label="Fullmektig for arbeidsgiver" feltNavn="fullmektigFirma" />
                <Skjema.Textarea label="Fullmektig adresse" maxLength={200} feltNavn="fullmektigAdresse" />
                <Skjema.Input label="Fullmektig telefon" feltNavn="fullmektigTelefon" />
                <Skjema.Input label="Fullmektig e-post" feltNavn="fullmektigEpost" />
              </dl>
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  ) : null;
}

UtsendendeArbeidsgiver.propTypes = {
  organisasjoner: MPT.Organisasjoner,
  soknadArbeidNorge: MPT.ArbeidNorge,
  utsendendeOrgnr: PT.string,
};

UtsendendeArbeidsgiver.defaultProps = {
  organisasjoner: [],
  soknadArbeidNorge: {},
  utsendendeOrgnr: '',
};

const mapStateToProps = state => ({
  organisasjoner: OrganisasjonSelector(state),
  soknadArbeidNorge: ArbeidNorgeSelector(state),
  utsendendeOrgnr: SoknadenFormSelector(state).values.utsendendeOrgnr,
});

export default reduxForm({ form: 'soknad' })(connect(mapStateToProps)(UtsendendeArbeidsgiver));
