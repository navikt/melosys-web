import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';

import { datoDiff } from '../../../utils/utils';

import './vurderingVedtak.css';

import {
  VurderingLovvalgbestemmelserSelector,
} from '../../../ducks/vurdering';

import {
  FaktaavklaringValgteArbeidsforholdDetaljerSelector,
  FaktaavklaringSysselsettingSelector,
  FaktaavklaringOppholdSelector,
} from '../../../ducks/faktaavklaring';

const uuid = require('uuid/v4');

const LovvalgBestemmelse = props => {
  const { bestemmelse } = props;
  // Neste linje hvor bestemmelsene listes ut må avvente til designet er på plass, men
  // den skal inn igjen om kort tid, så foreslår å ikke kaste ut koden.
  const { betingelser } = { betingelser: [] }; // bestemmelse;

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
  bestemmelse: PT.object.isRequired,
};

const VurderingVedtak = props => {
  const {
    lovvalgbestemmelser,
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
  lovvalgbestemmelser: PT.array.isRequired,
  opphold: PT.object.isRequired,
  valgteArbeidsforhold: PT.array.isRequired,
  sysselsetting: PT.object.isRequired,
};

const mapStateToProps = state => ({
  lovvalgbestemmelser: VurderingLovvalgbestemmelserSelector(state),
  opphold: FaktaavklaringOppholdSelector(state),
  valgteArbeidsforhold: FaktaavklaringValgteArbeidsforholdDetaljerSelector(state),
  sysselsetting: FaktaavklaringSysselsettingSelector(state),
});

export default connect(mapStateToProps)(VurderingVedtak);
