import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import * as MPT from '../../../proptypes/';

import { avklartefaktaSelectors } from '../../../ducks/avklartefakta/';
import { soknadSelectors } from '../../../ducks/soknad/';
import { KodeverkSelectors } from '../../../ducks/kodeverk/';

import { datoDiffMenneskelig } from '../../../utils/dato';
import { kodeverkObjektTilTerm, finnEnkeltKodeFraListe } from '../../../utils/kodeverk';
import Listevelger from '../../skjema/listevelger';

const VurderingArtikkel16 = props => {
  const {
    gyldigeOppholdLand,
    oppholdPeriode,
    alleLandkoder,
    alleLovvalg,
    lovvalgsunntak,
  } = props;

  const antallManeder = datoDiffMenneskelig(oppholdPeriode.fom, oppholdPeriode.tom);

  const landSomTekstListe = gyldigeOppholdLand
    .map(enkeltLand => finnEnkeltKodeFraListe(enkeltLand.landKode, alleLandkoder))
    .map(enkeltLandKode => kodeverkObjektTilTerm(enkeltLandKode))
    .join(', ');

  return (
    <div className="vedtak">
      <Nav.Undertittel>Anmodning om unntak etter artikkel 16.1</Nav.Undertittel>
      <div>
        <Nav.Row>
          <Nav.Column xs="6">
            <Nav.Element type="element">Lands lovgivning det søkes unntak fra:</Nav.Element>
            <Nav.Normaltekst>{landSomTekstListe}</Nav.Normaltekst>
          </Nav.Column>
          <Nav.Column xs="6">
            <Nav.Element type="element">Søknadsperiode</Nav.Element>
            <Nav.Normaltekst>{ oppholdPeriode.fom} {oppholdPeriode.tom } - {antallManeder}mnd</Nav.Normaltekst>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="6">
            <Nav.Element type="element">Artikkelen det søkes unntak fra:</Nav.Element>
            <Listevelger feltNavn="unntak.16" muligeValg={lovvalgsunntak}>nedtrekk</Listevelger>
          </Nav.Column>
          <Nav.Column xs="6">
            <Nav.Element type="element">Begrunnelse</Nav.Element>
            <Skjema.Input feltNavn="unntak.16" />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Element type="element">Begrunnelse til utenlandsk myndighet (engelsk)</Nav.Element>
            <Skjema.Textarea feltNavn="unntak.16" bredde="fullbredde" />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            <a href="http://melosys" target="_blank" rel="noopener noreferrer" className="vedtak__brevlenke">Forhåndsvis anmodning til utenlandsk myndighet</a>
            <a href="http://melosys" target="_blank" rel="noopener noreferrer" className="vedtak__brevlenke">Forhåndsvis brev til søker</a>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="6">
            <Nav.Knapp type="hoved" onClick={() => {}}>Fatt vedtak</Nav.Knapp>
          </Nav.Column>
        </Nav.Row>
      </div>
    </div>
  );
};

VurderingArtikkel16.propTypes = {
  lovvalgKode: PT.string.isRequired,
  lagreVedtakHandler: PT.func.isRequired,
  gyldigeOppholdLand: MPT.OppholdLand.isRequired,
  oppholdPeriode: MPT.OppholdPeriode.isRequired,
  alleLandkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  alleLovvalg: PT.arrayOf(MPT.Kodeverk).isRequired,
  lovvalgsunntak: PT.arrayOf(MPT.Kodeverk).isRequired,
};

const mapStateToProps = state => ({
  lovvalgKode: avklartefaktaSelectors.AvklartefaktaLovvalgKodeSelector(state),
  gyldigeOppholdLand: avklartefaktaSelectors.AvklartefaktaGyldigeOppholdLandSelector(state),
  oppholdPeriode: soknadSelectors.OppholdUtlandPeriodeSelector(state),
  alleLandkoder: KodeverkSelectors.landkoderSelector(state),
  alleLovvalg: KodeverkSelectors.alleLovvalgSelector(state),
  lovvalgsunntak: KodeverkSelectors.lovvalgsunntakSelector(state),
});

export default connect(mapStateToProps)(VurderingArtikkel16);
