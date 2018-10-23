import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes/';


import { avklartefaktaSelectors } from '../../../ducks/avklartefakta/';
import { soknadSelectors } from '../../../ducks/soknad/';
import { KodeverkSelectors } from '../../../ducks/kodeverk/';

import { datoDiffMenneskelig } from '../../../utils/dato';
import { kodeverkObjektTilTerm, kodeverkObjektTilKode, finnEnkeltKodeFraListe } from '../../../utils/kodeverk';

import './vurderingVedtak.css';

const VurderingVedtak = props => {
  // 1. Motta vedtakskode (kodeverk og avklartefakta)
  // 2. Motta begrunnelsene fra forrige steg (kodeverk og avklartefakta)
  // 3. Vise oppsummmeringen av kriteriene for artikkelen (kodeverk og avklartefakta)

  const {
    gyldigeOppholdLand,
    oppholdPeriode,
    alleLandkoder,
    alleLovvalg,
    lovvalgKode,
  } = props;

  const antallManeder = datoDiffMenneskelig(oppholdPeriode.fom, oppholdPeriode.tom);

  const landSomTekstListe = gyldigeOppholdLand
    .map(enkeltLand => finnEnkeltKodeFraListe(enkeltLand.landKode, alleLandkoder))
    .map(enkeltLandKode => kodeverkObjektTilTerm(enkeltLandKode))
    .join(', ');

  const lovvalgObjekt = finnEnkeltKodeFraListe(lovvalgKode, alleLovvalg);
  const lovvalgTerm = lovvalgObjekt && kodeverkObjektTilKode(lovvalgObjekt);

  return (
    <div className="vedtak">
      <Nav.Undertittel>Medlemskap i norsk folketrygd innvilges etter artikkel {lovvalgTerm}:</Nav.Undertittel>
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
            <a href="http://melosys" target="_blank" rel="noopener noreferrer" className="vedtak__brevlenke">Forhåndsvis vedtaksbrev</a>
            <a href="http://melosys" target="_blank" rel="noopener noreferrer" className="vedtak__brevlenke">Forhåndsvis A1</a>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="6" className="fane__fot">
            <Nav.Knapp type="hoved" onClick={() => props.lagreVedtakHandler()}>Fatt vedtak</Nav.Knapp>
          </Nav.Column>
        </Nav.Row>
      </div>
    </div>
  );
};

VurderingVedtak.propTypes = {
  lovvalgKode: PT.string.isRequired,
  lagreVedtakHandler: PT.func.isRequired,
  gyldigeOppholdLand: MPT.OppholdLand.isRequired,
  oppholdPeriode: MPT.OppholdPeriode.isRequired,
  alleLandkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  alleLovvalg: PT.arrayOf(MPT.Kodeverk).isRequired,
};

const mapStateToProps = state => ({
  lovvalgKode: avklartefaktaSelectors.AvklartefaktaLovvalgKodeSelector(state),
  gyldigeOppholdLand: avklartefaktaSelectors.AvklartefaktaGyldigeOppholdLandSelector(state),
  oppholdPeriode: soknadSelectors.OppholdUtlandPeriodeSelector(state),
  alleLandkoder: KodeverkSelectors.landkoderSelector(state),
  alleLovvalg: KodeverkSelectors.alleLovvalgSelector(state),
});

export default connect(mapStateToProps)(VurderingVedtak);
