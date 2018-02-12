import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes/';
import { datoDiff } from '../../../utils/utils';

import './vurderingVedtak.css';

import {
  VurderingLovvalgbestemmelserSelector,
  VurderingFeilmeldingSelector,
} from '../../../ducks/vurdering';

import {
  FaktaavklaringValgteArbeidsforholdDetaljerSelector,
  FaktaavklaringSysselsettingSelector,
  FaktaavklaringOppholdSelector,
} from '../../../ducks/faktaavklaring';

const uuid = require('uuid/v4');

const LovvalgBestemmelse = props => {
  const { bestemmelse } = props;
  const { betingelser } = bestemmelse;

  return (
    <div>
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Normaltekst key={uuid()}>Medlemsskap i norsk folketrygd er innvilget, etter artikkel {bestemmelse.artikkel}</Nav.Normaltekst>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row className="vedtak__betingelser">
        <Nav.Column xs="12">
          <ul className="betingelser__liste">
            {
              betingelser.map(betingelse => (
                <li key={uuid()} className="liste__element liste__element--oppfylt">{betingelse.krav}</li>
              ))
            }
          </ul>
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};

LovvalgBestemmelse.propTypes = {
  bestemmelse: MPT.Lovvalgsbestemmelse.isRequired,
};

const VurderingFeilmeldinger = props => {
  const { melding } = props;
  const { kategori, alvorlighetsgrad, feilmelding } = melding;
  return (
    <div>
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Normaltekst key={uuid()}>{kategori}: {alvorlighetsgrad}: {feilmelding}</Nav.Normaltekst>
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};
VurderingFeilmeldinger.propTypes = {
  melding: MPT.Feilmelding.isRequired,
};


const VurderingVedtak = props => {
  const {
    lovvalgbestemmelser,
    feilmeldinger,
    opphold,
    valgteArbeidsforhold,
    sysselsetting,
  } = props;

  const { land = [], periode = {} } = opphold;

  const { sysselsettingType = '' } = sysselsetting;

  const antallManeder = datoDiff(periode.fom, periode.tom, 'months');
  const arbeidsgivereForVedtaket = valgteArbeidsforhold
    .reduce((collection, arbeidsforholdet) => [...collection, arbeidsforholdet.arbeidsgiver.navn], [])
    .join(', ');

  return (
    <div className="vedtak">
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Undertittel>Foreslått vedtak:</Nav.Undertittel>
          </Nav.Column>
        </Nav.Row>
        {
          lovvalgbestemmelser.map(bestemmelse => (
            <LovvalgBestemmelse key={uuid()} bestemmelse={bestemmelse} />
          ))
        }
        <p>Feilmeldinger</p>
        {
          feilmeldinger && feilmeldinger.map(melding => (
            <VurderingFeilmeldinger key={uuid()} melding={melding} />
          ))
        }
        <Nav.Row className="vedtak__oppsummering">
          <Nav.Column xs="6" md="3">
            <Nav.Element type="element">Antall måneder i utlandet</Nav.Element>
            <Nav.Normaltekst>{antallManeder}</Nav.Normaltekst>
          </Nav.Column>
          <Nav.Column xs="6" md="3">
            <Nav.Element type="element">Land</Nav.Element>
            <Nav.Normaltekst>{ land.join(', ') }</Nav.Normaltekst>
          </Nav.Column>
          <Nav.Column xs="6" md="3">
            <Nav.Element type="element">Søker er</Nav.Element>
            <Nav.Normaltekst>{sysselsettingType}</Nav.Normaltekst>
          </Nav.Column>
          <Nav.Column xs="6" md="3">
            <Nav.Element type="element">Navn på arbeidsgiver</Nav.Element>
            <Nav.Normaltekst>{arbeidsgivereForVedtaket}</Nav.Normaltekst>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="6" className="fane__fot">
            <Nav.Knapp type="hoved" onClick={() => props.fattVedtakHandler()}>Fatt vedtak</Nav.Knapp>
          </Nav.Column>
          <Nav.Column xs="6" className="fane__fot">
            <a href="http://localhost">Forhåndsvis vedtaksbrev</a>
          </Nav.Column>
        </Nav.Row>
      </Nav.Container>
    </div>
  );
};

VurderingVedtak.propTypes = {
  fattVedtakHandler: PT.func.isRequired,
  lovvalgbestemmelser: PT.arrayOf(MPT.Lovvalgsbestemmelse).isRequired,
  feilmeldinger: PT.arrayOf(MPT.Feilmelding).isRequired,
  opphold: PT.object.isRequired,
  valgteArbeidsforhold: PT.array.isRequired,
  sysselsetting: PT.object.isRequired,
};

const mapStateToProps = state => ({
  lovvalgbestemmelser: VurderingLovvalgbestemmelserSelector(state),
  feilmeldinger: VurderingFeilmeldingSelector(state),
  opphold: FaktaavklaringOppholdSelector(state),
  valgteArbeidsforhold: FaktaavklaringValgteArbeidsforholdDetaljerSelector(state),
  sysselsetting: FaktaavklaringSysselsettingSelector(state),
});

export default connect(mapStateToProps)(VurderingVedtak);
