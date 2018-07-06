import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Skjema from './skjema';
import * as Ikoner from '../resources/images';

import { fagsakSelectors } from '../ducks/fagsaker/';

import PanelHeader from './panelHeader/panelHeader';
import Forretningsadresse from './adresser/forretningsadresse';
import Postadresse from './adresser/postadresse';

import './utsendendeArbeidsgiver.css';

const uuid = require('uuid/v4');

const Arbeidsgiver = ({ arbeidsgiver }) => {
  const {
    orgnr, navn, forretningsadresse, postadresse,
  } = arbeidsgiver;
  const postAdresseKomp = postadresse ? <div><dt>Postdresse</dt><dd><Postadresse postadresse={postadresse} /></dd></div> : null;
  const forretningsadresseKomp = forretningsadresse ? <div><dt>Forretningsadresse</dt><dd><Forretningsadresse forretningsadresse={forretningsadresse} /></dd></div> : null;

  return arbeidsgiver ? (
    <dl className="arbeidsgiver__detaljer">
      <dt>Navn</dt>
      <dd>{ navn } </dd>
      <dt>Orgnr / IDnr</dt>
      <dd>{ orgnr } </dd>
      <dt>Opprettet dato</dt>
      <dd>-</dd>
      <dt>Organisasjonsform</dt>
      <dd>-</dd>
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

const UtsendendeArbeidsgiver = props => {
  const { organisasjoner, soknadVerdier } = props;
  const { faktaavklaringValgteArbeidsgivere } = soknadVerdier;

  const valgteOrganisasjon = organisasjoner && organisasjoner.reduce((samling, organisasjonen) =>
    (faktaavklaringValgteArbeidsgivere.includes(organisasjonen.orgnr) ? [...samling, organisasjonen] : [...samling]), []);

  const panelIkon = valgteOrganisasjon.length === 1 ? Ikoner.Ferdig : Ikoner.Varsel;

  const dobbelVarsel = valgteOrganisasjon.length > 1 && <Nav.AlertStripe type="advarsel">Det er mer enn 1 utsendende arbeidsgiver</Nav.AlertStripe>;

  return (
    <div className="utsendendeArbeidsgiver panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Utsendende arbeidsgiver" undertittel="" />}
        ariaTittel="Panel for utsendende arbeidsgiver i Norge">
        <Nav.Container fluid>
          {dobbelVarsel}
          <Nav.Row className="arbeidsgiver__seksjon">
            <Nav.Column xs="6">
              {valgteOrganisasjon.map(item => <Arbeidsgiver key={uuid()} arbeidsgiver={item} />) }
            </Nav.Column>
            <Nav.Column xs="6">
              <dl className="arbeidsgiver__detaljer">
                <Skjema.Input label="Kontaktperson" feltNavn="kontaktNavn" />
                <Skjema.Input label="E-post" feltNavn="kontaktEpost" />
                <Nav.Element>Dersom fullmektig har sendt søknaden på vegne av arbeidsgiver:</Nav.Element>
                <Skjema.Input label="Fullmektig firma" feltNavn="fullmektigFirma" />
                <Skjema.Textarea label="Fullmektig adresse" maxLength={200} feltNavn="fullmektigAdresse" />
              </dl>
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
};

UtsendendeArbeidsgiver.propTypes = {
  organisasjoner: MPT.Organisasjoner,
  soknadVerdier: PT.object,
};

UtsendendeArbeidsgiver.defaultProps = {
  organisasjoner: [],
  soknadVerdier: {},
};

const mapStateToProps = state => ({
  organisasjoner: fagsakSelectors.OrganisasjonerSelector(state),
});

export default (connect(mapStateToProps)(UtsendendeArbeidsgiver));
