import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes/';

import { avklartefaktaSelectors } from '../../../ducks/avklartefakta/';
import { soknadSelectors } from '../../../ducks/soknad/';
import { KodeverkSelectors } from '../../../ducks/kodeverk/';
import { fagsakSelectors } from '../../../ducks/fagsaker/';

import { datoDiffMenneskelig } from '../../../utils/dato';
import { kodeverkObjektTilKode, finnEnkeltKodeFraListe } from '../../../utils/kodeverk';
import PdfLenkeListe from '../../../felles-komponenter/pdfLenkeListe';

import './vurderingVedtak.css';

const VurderingVedtak = props => {
  // 1. Motta vedtakskode (kodeverk og avklartefakta)
  // 2. Motta begrunnelsene fra forrige steg (kodeverk og avklartefakta)
  // 3. Vise oppsummmeringen av kriteriene for artikkelen (kodeverk og avklartefakta)

  const {
    gyldigeOppholdLand,
    oppholdPeriode,
    alleLovvalg,
    lovvalgKode,
  } = props;

  const { behandlingID } = props.oppsummering;

  const antallManeder = datoDiffMenneskelig(oppholdPeriode.fom, oppholdPeriode.tom);

  const landSomTekstListe = gyldigeOppholdLand.map(enkeltLand => enkeltLand.term).join(', ');

  const lovvalgObjekt = finnEnkeltKodeFraListe(lovvalgKode, alleLovvalg);
  const lovvalgTerm = lovvalgObjekt && kodeverkObjektTilKode(lovvalgObjekt);

  const dokumenter = [
    { navn: 'Forhåndsvis A1', type: 'ATTEST_A1', data: {} },
  ];

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
  lovvalgKode: PT.string.isRequired,
  lagreVedtakHandler: PT.func.isRequired,
  gyldigeOppholdLand: MPT.OppholdLand.isRequired,
  oppholdPeriode: MPT.OppholdPeriode.isRequired,
  alleLovvalg: PT.arrayOf(MPT.Kodeverk).isRequired,
  oppsummering: MPT.Oppsummering.isRequired,
};

const mapStateToProps = state => ({
  lovvalgKode: avklartefaktaSelectors.AvklartefaktaLovvalgKodeSelector(state),
  gyldigeOppholdLand: avklartefaktaSelectors.AvklartefaktaGyldigeOppholdLandSelector(state),
  oppholdPeriode: soknadSelectors.OppholdUtlandPeriodeSelector(state),
  alleLovvalg: KodeverkSelectors.alleLovvalgSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
});

export default connect(mapStateToProps)(VurderingVedtak);
