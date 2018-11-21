import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes/';

import { avklartefaktaSelectors } from '../../../ducks/avklartefakta/';
import { soknadSelectors } from '../../../ducks/soknad/';
import { KodeverkSelectors } from '../../../ducks/kodeverk/';
import { fagsakSelectors } from '../../../ducks/fagsaker/';
import { lovvalgsperioderSelectors } from '../../../ducks/lovvalgsperioder/';

import { datoDiffMenneskelig } from '../../../utils/dato';
import { finnEnkeltKodeFraListe, kodeverkObjektTilTerm } from '../../../utils/kodeverk';
import PdfLenkeListe from '../../../felles-komponenter/pdfLenkeListe';

import './vurderingVedtak.css';

const VurderingVedtak = props => {
  // 1. Motta vedtakskode (kodeverk og avklartefakta)
  // 2. Motta begrunnelsene fra forrige steg (kodeverk og avklartefakta)
  // 3. Vise oppsummmeringen av kriteriene for artikkelen (kodeverk og avklartefakta)

  const {
    gyldigeOppholdLand,
    alleLovvalg,
    lovvalgsperioder,
  } = props;

  const { behandlingID } = props.oppsummering;

  const lovvalget = lovvalgsperioder[0] || {};

  const {
    fomDato, tomDato, lovvalgBestemmelse, lovvalgsResultat,
  } = lovvalget;

  const antallManeder = datoDiffMenneskelig(fomDato, tomDato);
  const lovvalgSomKodeTerm = finnEnkeltKodeFraListe(lovvalgBestemmelse, alleLovvalg);

  const landSomTekstListe = gyldigeOppholdLand.map(enkeltLand => enkeltLand.term).join(', ');

  const dokumenter = [
    { navn: 'Forhåndsvis vedtaksbrev', type: 'INNVILGELSE_YRKESAKTIV', data: {} },
    { navn: 'Forhåndsvis A1', type: 'ATTEST_A1', data: {} },
  ];

  return (
    <div className="vedtak">
      <Nav.Undertittel>Medlemskap i norsk folketrygd {lovvalgsResultat} etter<br />{ kodeverkObjektTilTerm(lovvalgSomKodeTerm) }:</Nav.Undertittel>
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
            <PdfLenkeListe behandlingID={behandlingID} dokumenter={dokumenter} />
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
  lagreVedtakHandler: PT.func.isRequired,
  lovvalgsperioder: PT.array.isRequired,
  gyldigeOppholdLand: MPT.OppholdLand.isRequired,
  oppholdPeriode: MPT.OppholdPeriode.isRequired,
  alleLovvalg: PT.arrayOf(MPT.Kodeverk).isRequired,
  oppsummering: MPT.Oppsummering.isRequired,
};

const mapStateToProps = state => ({
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  gyldigeOppholdLand: avklartefaktaSelectors.AvklartefaktaGyldigeOppholdLandSelector(state),
  oppholdPeriode: soknadSelectors.OppholdUtlandPeriodeSelector(state),
  alleLovvalg: KodeverkSelectors.alleLovvalgSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
});

export default connect(mapStateToProps)(VurderingVedtak);
