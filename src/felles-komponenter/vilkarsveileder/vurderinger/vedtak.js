import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';

import { datoDiff } from '../../../utils/utils';

import './vedtak.css';

import { FaktaavklaringSysselsettingSelector } from '../../../ducks/faktaavklaring';

import {
  VurderingLovvalgbestemmelserSelector,
} from '../../../ducks/vurdering';

import {
  ArbeidUtlandSelector,
  ValgteArbeidsforhold,
} from '../../../ducks/soknad';

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

const Vedtak = props => {
  const {
    lovvalgbestemmelser,
    arbeidUtland,
    valgteArbeidsforhold,
    arbeidstype,
  } = props;

  const { arbeidsperiode = {} } = arbeidUtland;

  const { arbeidstype: arbeidstypen = '' } = arbeidstype;

  const antallManeder = datoDiff(arbeidsperiode.fom, arbeidsperiode.tom, 'months');
  const { arbeidsland = [] } = arbeidUtland;
  const arbeidsgivere = valgteArbeidsforhold
    .reduce((collection, arbeidsforhold) => [...collection, arbeidsforhold.arbeidsgiver.navn], [])
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
            <Nav.Normaltekst>{ arbeidsland.join(', ') }</Nav.Normaltekst>
          </Nav.Column>
          <Nav.Column xs="6" md="3">
            <Nav.Element type="element">Søker er</Nav.Element>
            <Nav.Normaltekst>{arbeidstypen}</Nav.Normaltekst>
          </Nav.Column>
          <Nav.Column xs="6" md="3">
            <Nav.Element type="element">Navn på arbeidsgiver</Nav.Element>
            <Nav.Normaltekst>{arbeidsgivere}</Nav.Normaltekst>
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

Vedtak.propTypes = {
  fattVedtakHandler: PT.func.isRequired,
  lovvalgbestemmelser: PT.array.isRequired,
  arbeidUtland: PT.object.isRequired,
  valgteArbeidsforhold: PT.array.isRequired,
  arbeidstype: PT.object.isRequired,
};

const mapStateToProps = state => ({
  lovvalgbestemmelser: VurderingLovvalgbestemmelserSelector(state),
  arbeidUtland: ArbeidUtlandSelector(state),
  valgteArbeidsforhold: ValgteArbeidsforhold(state),
  arbeidstype: FaktaavklaringSysselsettingSelector(state),
});

export default connect(mapStateToProps)(Vedtak);
