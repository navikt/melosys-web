import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import classnames from 'classnames';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes/';
import { datoDiff } from '../../../utils/dato';

import './vurderingVedtak.css';

import { vurderingSelectors } from '../../../ducks/vurdering/';

import { faktaavklaringSelectors } from '../../../ducks/faktaavklaring/';

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
                <li key={uuid()} className="liste__element liste__element--oppfylt">{betingelse.argument}</li>
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
  const { feilmelding } = props;
  const { kategori, melding } = feilmelding;
  const { alvorlighetsgrad, beskrivelse } = kategori;
  return (
    <div>
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Normaltekst key={uuid()}>{beskrivelse}: {alvorlighetsgrad}: {melding}</Nav.Normaltekst>
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};
VurderingFeilmeldinger.propTypes = {
  feilmelding: MPT.Feilmelding.isRequired,
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

  const venteskjermKlasser = classnames({ vedtak__venteskjerm: true, 'vedtak__venteskjerm--skjult': props.vurderingStatus !== 'PENDING' });

  return (
    <div className="vedtak">
      <div className={venteskjermKlasser}>
        <Nav.NavFrontendSpinner type="XL" />
        <Nav.Element>Lagrer faktaavklaring og ber om vedtaksforslag</Nav.Element>
      </div>
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Undertittel>Vilkårsresultat:</Nav.Undertittel>
          </Nav.Column>
        </Nav.Row>
        {
          lovvalgbestemmelser.map(bestemmelse => (
            <LovvalgBestemmelse key={uuid()} bestemmelse={bestemmelse} />
          ))
        }
        { feilmeldinger && feilmeldinger.length > 0 && <p>Feilmeldinger</p>}
        {
          feilmeldinger && feilmeldinger.map(feilmelding => (
            <VurderingFeilmeldinger key={uuid()} feilmelding={feilmelding} />
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
            <Nav.Knapp type="hoved" onClick={() => props.fattVedtak()}>Fatt vedtak</Nav.Knapp>
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
  fattVedtak: PT.func.isRequired,
  lovvalgbestemmelser: MPT.Lovvalgsbestemmelser.isRequired,
  vurderingStatus: PT.string.isRequired,
  feilmeldinger: MPT.Feilmeldinger.isRequired,
  opphold: MPT.Opphold.isRequired,
  valgteArbeidsforhold: MPT.Arbeidsforholdene.isRequired,
  sysselsetting: MPT.Sysselsetting.isRequired,
};

const mapStateToProps = state => ({
  lovvalgbestemmelser: vurderingSelectors.VurderingLovvalgbestemmelserSelector(state),
  feilmeldinger: vurderingSelectors.VurderingFeilmeldingSelector(state),
  vurderingStatus: vurderingSelectors.VurderingStatusSelector(state),
  opphold: faktaavklaringSelectors.FaktaavklaringOppholdSelector(state),
  valgteArbeidsforhold: faktaavklaringSelectors.FaktaavklaringValgteArbeidsforholdDetaljerSelector(state),
  sysselsetting: faktaavklaringSelectors.FaktaavklaringSysselsettingSelector(state),
});

export default connect(mapStateToProps)(VurderingVedtak);
