import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../../../../../kodeverk';
import * as Nav from '../../../../../utils/navFrontend';
import * as MPT from '../../../../../proptypes';

import { avklartefaktaSelectors } from '../../../../../ducks/avklartefakta';
import { behandlingerSelectors } from '../../../../../ducks/behandlinger';
import { lovvalgsperioderSelectors } from '../../../../../ducks/lovvalgsperioder';

import { datoDiffMenneskelig } from '../../../../../utils/dato';
import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';
import DatoOmrade from '../../../../../felleskomponenter/datoOmrade/datoOmrade';

import './vurderingVedtak.css';

const alleLovvalg = [
  ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004,
  ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009,
  ...MKV.KTObjects.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004,
];

const VurderingVedtak = ({
  lovvalgsperioder,
  redigerbart,
  behandlingID,
  lagreOgFatteVedtak,
}) => {
  // 1. Motta vedtakskode (kodeverk og avklartefakta)
  // 2. Motta begrunnelsene fra forrige steg (kodeverk og avklartefakta)
  // 3. Vise oppsummmeringen av kriteriene for artikkelen (kodeverk og avklartefakta)

  const lovvalget = lovvalgsperioder[0] || {};

  const {
    fomDato, tomDato, lovvalgsbestemmelse,
  } = lovvalget;

  const antallManeder = datoDiffMenneskelig(fomDato, tomDato);
  const lovvalgSomKodeTerm = KV.finnEnkeltKodeFraListe(lovvalgsbestemmelse, alleLovvalg);

  const pdfDokumenter = [
    { navn: 'Forhåndsvis vedtaksbrev og A1', type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV, data: { mottaker: MKV.Koder.aktoersroller.BRUKER } },
  ];

  if (lovvalgSomKodeTerm && lovvalgSomKodeTerm.kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_1) {
    pdfDokumenter.push({ navn: 'Orienteringsbrev til arbeidsgiver', type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_ARBEIDSGIVER, data: { mottaker: MKV.Koder.aktoersroller.ARBEIDSGIVER } });
  }

  return (
    <div className="vedtak">
      <Nav.Undertittel>Omfattet av norsk trygdelovgivning etter { KV.objektTilTerm(lovvalgSomKodeTerm) }</Nav.Undertittel>
      <div>
        <Nav.Row className="lovvalgsperiode">
          <Nav.Column xs="6">
            <DatoOmrade periode={{ fom: lovvalget.fomDato, tom: lovvalget.tomDato }} label="Lovvalgsperiode" />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row className="vedtak__oppsummering">
          <Nav.Column xs="6">
            <Nav.Element type="element">Antall måneder i utlandet</Nav.Element>
            <Nav.Normaltekst>{antallManeder}</Nav.Normaltekst>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="6" className="fane__fot">
            {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="6" className="fane__fot">
            <Nav.Hovedknapp disabled={!redigerbart} onClick={() => lagreOgFatteVedtak(MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND)}>Fatt vedtak</Nav.Hovedknapp>
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
  behandlingID: PT.number.isRequired,
  redigerbart: PT.bool.isRequired,
  lovvalgsland: PT.string,
};

VurderingVedtak.defaultProps = {
  lovvalgsland: '',
};

const mapStateToProps = state => ({
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  gyldigeSoknadsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  lovvalgsland: lovvalgsperioderSelectors.LovvalgslandSelector(state),
});

export default connect(mapStateToProps)(VurderingVedtak);
