import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Skjema from './skjema';
import * as Ikoner from '../resources/images';

import { fagsakSelectors } from '../ducks/fagsaker/';
import { avklartefaktaSelectors } from '../ducks/avklartefakta/';

import { formatterDatoTilNorsk } from '../utils/dato';

import PanelHeader from './panelHeader/panelHeader';
import ForretningsAdresse from './adresser/forretningsAdresse';
import PostAdresse from './adresser/postAdresse';
import LandVelger from './skjema/landvelger';

import './utsendendeArbeidsgiver.css';

const uuid = require('uuid/v4');

const Arbeidsgiver = ({ arbeidsgiver }) => {
  if (!arbeidsgiver) return null;

  const {
    orgnr, navn, oppstartdato, organisasjonsform, forretningsadresse, postadresse,
  } = arbeidsgiver;
  const postAdresseKomp = postadresse ? <div><dt>Postdresse</dt><dd><PostAdresse postadresse={postadresse} /></dd></div> : null;
  const forretningsadresseKomp = forretningsadresse ? <div><dt>Forretningsadresse</dt><dd><ForretningsAdresse forretningsadresse={forretningsadresse} /></dd></div> : null;

  return arbeidsgiver ? (
    <dl className="arbeidsgiver__detaljer">
      <dt>Navn</dt>
      <dd>{ navn } </dd>
      <dt>Orgnr / IDnr</dt>
      <dd>{ orgnr } </dd>
      <dt>Oppstartdato</dt>
      <dd>{formatterDatoTilNorsk(oppstartdato) || '(ukjent)'}</dd>
      <dt>Organisasjonsform</dt>
      <dd>{organisasjonsform || '(ukjent)'}</dd>
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
  const { redigerbart, valgteArbeidsgivere } = props;

  const panelIkon = valgteArbeidsgivere.length === 1 ? Ikoner.Ferdig : Ikoner.Varsel;

  const dobbelVarsel = valgteArbeidsgivere.length > 1 && <Nav.AlertStripe type="advarsel">Du har valgt mer enn 1 utsendende arbeidsgiver.</Nav.AlertStripe>;

  return valgteArbeidsgivere.length > 0 ? (
    <div className="utsendendeArbeidsgiver panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Utsendende arbeidsgiver" undertittel="" />}
        ariaTittel="Panel for utsendende arbeidsgiver i Norge">
        <Nav.Container fluid>
          {dobbelVarsel}
          <Nav.Row className="arbeidsgiver__seksjon">
            <Nav.Column xs="6">
              {valgteArbeidsgivere.map(item => <Arbeidsgiver key={uuid()} arbeidsgiver={item} />) }
            </Nav.Column>
            <Nav.Column xs="6">
              <div className="arbeidsgiver__detaljer">
                <Skjema.Input disabled={!redigerbart} label="Kontaktperson" feltNavn="kontaktNavn" />
                <Skjema.Input disabled={!redigerbart} label="E-post" feltNavn="kontaktEpost" />
                <Nav.Element>Dersom fullmektig har sendt søknaden på vegne av arbeidsgiver:</Nav.Element>
                <Skjema.Input disabled={!redigerbart} label="Fullmektig firma" feltNavn="fullmektigFirma" />
                <Skjema.Input disabled={!redigerbart} label="Gateadresse" feltNavn="fullmektigGateadresse" />
                <Skjema.Input disabled={!redigerbart} label="Postnummer" bredde="XS" feltNavn="fullmektigPostnr" />
                <Skjema.Input disabled={!redigerbart} label="Poststed" feltNavn="fullmektigPoststed" />
                <Skjema.Input disabled={!redigerbart} label="Region" feltNavn="fullmektigRegion" />
                <LandVelger disabled={!redigerbart} label="Land" feltNavn="fullmektigLand" />
              </div>
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  ) : null;
};

UtsendendeArbeidsgiver.propTypes = {
  redigerbart: PT.bool.isRequired,
  organisasjoner: MPT.Organisasjoner,
  soknadVerdier: PT.object,
  valgteArbeidsgivere: PT.array.isRequired,
};

UtsendendeArbeidsgiver.defaultProps = {
  organisasjoner: [],
  soknadVerdier: {},
};

const mapStateToProps = state => ({
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
  organisasjoner: fagsakSelectors.OrganisasjonerSelector(state),
  valgteArbeidsgivere: avklartefaktaSelectors.AvklartefaktaValgteArbeidsgivereSelector(state),
});

export default (connect(mapStateToProps)(UtsendendeArbeidsgiver));
