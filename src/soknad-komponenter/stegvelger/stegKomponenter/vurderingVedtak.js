import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../../../kodeverk';
import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes/';

import { avklartefaktaSelectors } from '../../../ducks/avklartefakta/';
import { soknadSelectors } from '../../../ducks/soknad/';
import { fagsakSelectors } from '../../../ducks/fagsaker/';
import { lovvalgsperioderSelectors } from '../../../ducks/lovvalgsperioder/';

import { datoDiffMenneskelig } from '../../../utils/dato';
import PdfLenkeListe from '../../pdfLenkeListe';

import './vurderingVedtak.css';

const alleLovvalg = [
  ...MKV.KTObjects.lovvalgsbestemmelser.forordning_883_2004,
  ...MKV.KTObjects.lovvalgsbestemmelser.forordning_987_2009,
  ...MKV.KTObjects.lovvalgsbestemmelser.tillegg,
];

const VurderingVedtak = ({
  gyldigeSoknadsland,
  lovvalgsperioder,
  redigerbart,
  oppsummering: { behandlingID },
  lagreOgFatteVedtak,
  lovvalgsland,
}) => {
  // 1. Motta vedtakskode (kodeverk og avklartefakta)
  // 2. Motta begrunnelsene fra forrige steg (kodeverk og avklartefakta)
  // 3. Vise oppsummmeringen av kriteriene for artikkelen (kodeverk og avklartefakta)

  const lovvalget = lovvalgsperioder[0] || {};

  const {
    fomDato, tomDato, lovvalgBestemmelse, lovvalgsResultat,
  } = lovvalget;

  const antallManeder = datoDiffMenneskelig(fomDato, tomDato);
  const lovvalgSomKodeTerm = KV.finnEnkeltKodeFraListe(lovvalgBestemmelse, alleLovvalg);

  const landSomTekstListe = gyldigeSoknadsland.map(enkeltLand => enkeltLand.term).join(', ');

  const dokumenter = [
    { navn: 'Forhåndsvis vedtaksbrev', type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV, data: { mottaker: MKV.Koder.aktoersroller.BRUKER } },
    { navn: 'Forhåndsvis A1 til utenlandsk myndighet', type: MKV.Koder.brev.produserbaredokumenter.ATTEST_A1, data: { mottaker: MKV.Koder.aktoersroller.MYNDIGHET } },
    { navn: 'Orienteringsbrev til arbeidsgiver', type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_ARBEIDSGIVER, data: { mottaker: MKV.Koder.aktoersroller.ARBEIDSGIVER } },
  ];

  const lovvalgslandTekst = KV.kodeTilTerm(lovvalgsland, MKV.KTObjects.landkoder) || '...';

  return (
    <div className="vedtak">
      <Nav.Undertittel>Medlemskap i norsk folketrygd {lovvalgsResultat} etter<br />{ KV.objektTilTerm(lovvalgSomKodeTerm) }:</Nav.Undertittel>
      <div>
        <Nav.Row className="vedtak__oppsummering">
          <Nav.Column xs="6">
            <Nav.Element type="element">Antall måneder i utlandet</Nav.Element>
            <Nav.Normaltekst>{antallManeder}</Nav.Normaltekst>
          </Nav.Column>
          <Nav.Column xs="6">
            <Nav.Element type="element">Arbeidsland</Nav.Element>
            <Nav.Normaltekst>{ landSomTekstListe }</Nav.Normaltekst>
          </Nav.Column>
          <Nav.Column xs="6">
          </Nav.Column>
          <Nav.Column xs="6">
            <Nav.Element type="element">Lovvalgsland</Nav.Element>
            <Nav.Normaltekst>{ lovvalgslandTekst }</Nav.Normaltekst>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="6" className="fane__fot">
            {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={dokumenter} />}
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="6" className="fane__fot">
            <Nav.Knapp disabled={!redigerbart} type="hoved" onClick={() => lagreOgFatteVedtak(MKV.Koder.behandlinger.resultattyper.FASTSATT_LOVVALGSLAND)}>Fatt vedtak</Nav.Knapp>
          </Nav.Column>
        </Nav.Row>
      </div>
    </div>
  );
};

VurderingVedtak.propTypes = {
  lagreOgFatteVedtak: PT.func.isRequired,
  lovvalgsperioder: PT.array.isRequired,
  gyldigeSoknadsland: MPT.Soknadsland.isRequired,
  soknadsperiode: MPT.Soknadsperiode.isRequired,
  oppsummering: MPT.Oppsummering.isRequired,
  redigerbart: PT.bool.isRequired,
  lovvalgsland: PT.string,
};

VurderingVedtak.defaultProps = {
  lovvalgsland: '',
};

const mapStateToProps = state => ({
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  gyldigeSoknadsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  soknadslande: soknadSelectors.SoknadsperiodeSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  lovvalgsland: lovvalgsperioderSelectors.LovvalgslandSelector(state),
});

export default connect(mapStateToProps)(VurderingVedtak);
