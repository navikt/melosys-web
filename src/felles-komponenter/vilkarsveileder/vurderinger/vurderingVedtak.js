import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes/';

import './vurderingVedtak.css';

import { vurderingSelectors } from '../../../ducks/vurdering/';

import { faktaavklaringSelectors } from '../../../ducks/faktaavklaring/';
import { soknadSelectors } from '../../../ducks/soknad/';
import { KodeverkSelectors } from '../../../ducks/kodeverk/';

import { datoDiffMenneskelig } from '../../../utils/dato';
import { kodeverkObjektTilTerm, finnEnkeltKodeFraListe } from '../../../utils/kodeverk';

const VurderingVedtak = props => {
  // 1. Motta vedtakskode (kodeverk og faktaavklaring)
  // 2. Motta begrunnelsene fra forrige steg (kodeverk og faktaavklaring)
  // 3. Vise oppsummmeringen av kriteriene for artikkelen (kodeverk og faktaavklaring)

  const {
    gyldigeOppholdLand,
    oppholdPeriode,
    alleLandkoder,
  } = props;

  const antallManeder = datoDiffMenneskelig(oppholdPeriode.fom, oppholdPeriode.tom);

  const landSomTekstListe = gyldigeOppholdLand
    .map(enkeltLand => finnEnkeltKodeFraListe(enkeltLand.landKode, alleLandkoder))
    .map(enkeltLandKode => kodeverkObjektTilTerm(enkeltLandKode))
    .join(', ');

  return (
    <div className="vedtak">
      <Nav.Undertittel>Medlemskap i norsk folketrygd innvilges etter artikkel 12.1:</Nav.Undertittel>
      <div>
        <Nav.Row className="vedtak__oppsummering">
          <Nav.Column xs="6">
            <Nav.Element type="element">Antall måneder i utlandet</Nav.Element>
            <Nav.Normaltekst>{antallManeder}</Nav.Normaltekst>
          </Nav.Column>
          <Nav.Column xs="6">
            <Nav.Element type="element">Land</Nav.Element>
            <Nav.Normaltekst>{ landSomTekstListe }</Nav.Normaltekst>
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
      </div>
    </div>
  );
};

VurderingVedtak.propTypes = {
  fattVedtak: PT.func.isRequired,
  lovvalgbestemmelser: MPT.Lovvalgsbestemmelser.isRequired,
  vurderingStatus: PT.string.isRequired,
  feilmeldinger: MPT.Feilmeldinger.isRequired,
  gyldigeOppholdLand: MPT.OppholdLand.isRequired,
  oppholdPeriode: MPT.OppholdPeriode.isRequired,
  alleLandkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
};

const mapStateToProps = state => ({
  lovvalgbestemmelser: vurderingSelectors.VurderingLovvalgbestemmelserSelector(state),
  feilmeldinger: vurderingSelectors.VurderingFeilmeldingSelector(state),
  vurderingStatus: vurderingSelectors.VurderingStatusSelector(state),
  gyldigeOppholdLand: faktaavklaringSelectors.FaktaavklaringGyldigeOppholdLandSelector(state),
  oppholdPeriode: soknadSelectors.OppholdUtlandSelector(state).oppholdsPeriode,
  alleLandkoder: KodeverkSelectors.landkoderSelector(state),
});

export default connect(mapStateToProps)(VurderingVedtak);
