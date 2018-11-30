import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import * as MPT from '../../../proptypes/';
import * as Koder from '../../../koder';

import { avklartefaktaSelectors } from '../../../ducks/avklartefakta/';
import { soknadSelectors } from '../../../ducks/soknad/';
import { KodeverkSelectors } from '../../../ducks/kodeverk/';
import { fagsakSelectors } from '../../../ducks/fagsaker';

import { dokumenterOperations } from '../../../ducks/dokumenter';

import { datoDiffMenneskelig } from '../../../utils/dato';
import Listevelger from '../../skjema/listevelger';
import DatoOmrade from '../../datoOmrade/datoOmrade';

import './vurderingArtikkel16.css';

const EnkeltPeriode = ({ linjeID, alleLovvalg }) => (
  <Nav.Row>
    <Nav.Column xs="4"><Skjema.Input feltNavn={`${linjeID}.fom`} datoFelt label="F.o.m." /></Nav.Column>
    <Nav.Column xs="4"><Skjema.Input feltNavn={`${linjeID}.tom`} datoFelt label="T.o.m." /></Nav.Column>
    <Nav.Column xs="4"><Listevelger feltNavn={`${linjeID}.lovvalg`} label="Lovvalg for perioden" muligeValg={alleLovvalg} /></Nav.Column>
  </Nav.Row>
);

EnkeltPeriode.propTypes = {
  linjeID: PT.string.isRequired,
  alleLovvalg: PT.arrayOf(MPT.Kodeverk).isRequired,
};

const TidligerePerioder = ({ fields, alleLovvalg }) => (
  <div>
    {fields.map(linjeID => (<EnkeltPeriode key={linjeID} linjeID={linjeID} alleLovvalg={alleLovvalg} />))}
    <Nav.Row>
      <Nav.Column xs="12"><Nav.Knapp onClick={() => fields.push({})}>+ Legg til periode</Nav.Knapp></Nav.Column>
    </Nav.Row>
  </div>
);

TidligerePerioder.propTypes = {
  fields: PT.object.isRequired,
  alleLovvalg: PT.arrayOf(MPT.Kodeverk).isRequired,
};

class VurderingArtikkel16 extends Component {
  forhandsvisPDF = async kode => {
    const { oppsummering, forhandsvisPDF } = this.props;
    const { behandlingID } = oppsummering;

    const fileURL = await forhandsvisPDF(behandlingID, kode, {});
    window.open(fileURL);
  };

  render () {
    const {
      alleLovvalg,
      anmodningsBegrunnelser,
      lagreOgFatteVedtak,
      gyldigeOppholdLand,
      oppholdPeriode,
      lovvalgsunntak,
    } = this.props;

    const { forhandsvisPDF } = this;

    const antallManeder = datoDiffMenneskelig(oppholdPeriode.fom, oppholdPeriode.tom);

    const landSomTekstListe = gyldigeOppholdLand.map(enkeltLandObjekt => enkeltLandObjekt.term).join(', ');

    return (
      <div>
        <Nav.Undertittel>Anmodning om unntak etter artikkel 16.1</Nav.Undertittel>
        <div className="artikkel16">
          <Nav.Row className="artikkel16__ekstratopp">
            <Nav.Column xs="6">
              <Nav.Element type="element">Lands lovgivning det søkes unntak fra:</Nav.Element>
              <Nav.Normaltekst>{landSomTekstListe}</Nav.Normaltekst>
            </Nav.Column>
            <Nav.Column xs="6">
              <Nav.Element type="element">Antall måneder:</Nav.Element>
              <Nav.Normaltekst>{antallManeder}</Nav.Normaltekst>
              <DatoOmrade periode={oppholdPeriode} />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="10">
              <Skjema.Select feltNavn="lovvalgsperiode.unntakFraBestemmelse" label="Artikkelen det søkes unntak fra:" bredde="m" >
                { lovvalgsunntak.map(kodeObjekt => <option key={kodeObjekt.kode} value={kodeObjekt.kode}>{kodeObjekt.term}</option>)}
              </Skjema.Select>
              <Listevelger gruppe muligeValg={anmodningsBegrunnelser} feltNavn="vilkar.art16_1_begrunnelser" label="Legg til begrunnelse:" />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12">
              <Skjema.Textarea feltNavn="vilkar.art16_1_begrunnelser_fritekst" label="Begrunnelse til utenlandsk myndighet (engelsk):" maxLength={255} bredde="fullbredde" />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row className="artikkel16__ekstratopp">
            <Nav.Column xs="12">
              <Nav.Fieldset legend={`Direkte forutgående perioder i ${landSomTekstListe}:`}>
                <FieldArray name="lovvalgsperiode.tidligere" component={TidligerePerioder} alleLovvalg={alleLovvalg} />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12">
              <button className="forhandsvisPDF" onClick={() => forhandsvisPDF('INNVILGELSE_YRKESAKTIV')}>Forhåndsvis anmodning til utenlandsk myndighet</button>
            </Nav.Column>
            <Nav.Column xs="12">
              <button className="forhandsvisPDF" onClick={() => forhandsvisPDF('INNVILGELSE_YRKESAKTIV')}>Forhåndsvis brev til søker</button>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row className="artikkel16__ekstratopp">
            <Nav.Column xs="6">
              <Nav.Hovedknapp type="hoved" onClick={() => lagreOgFatteVedtak(Koder.ANMODNING_OM_UNNTAK)}>Send anmodning til utenlandsk myndighet</Nav.Hovedknapp>
            </Nav.Column>
          </Nav.Row>
        </div>
      </div>
    );
  }
}

VurderingArtikkel16.propTypes = {
  anmodningsBegrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  alleLovvalg: PT.arrayOf(MPT.Kodeverk).isRequired,
  lagreOgFatteVedtak: PT.func.isRequired,
  forhandsvisPDF: PT.func.isRequired,
  gyldigeOppholdLand: MPT.OppholdLand.isRequired,
  oppholdPeriode: MPT.OppholdPeriode.isRequired,
  oppsummering: PT.object.isRequired,
  lovvalgKode: PT.string.isRequired,
  lovvalgsunntak: PT.arrayOf(MPT.Kodeverk).isRequired,
};

const mapStateToProps = state => ({
  alleLovvalg: KodeverkSelectors.alleLovvalgSelector(state),
  anmodningsBegrunnelser: KodeverkSelectors.anmodningsBegrunnelserSelector(state),
  gyldigeOppholdLand: avklartefaktaSelectors.AvklartefaktaGyldigeOppholdLandSelector(state),
  lovvalgKode: avklartefaktaSelectors.AvklartefaktaLovvalgKodeSelector(state),
  lovvalgsunntak: KodeverkSelectors.lovvalgsunntakSelector(state),
  oppholdPeriode: soknadSelectors.OppholdUtlandPeriodeSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
});

const mapDispatchToProps = () => ({
  forhandsvisPDF: (behandlingID, dokumenttypeKode, data) => dokumenterOperations.forhandsvisPDF(behandlingID, dokumenttypeKode, data),
});

export default connect(mapStateToProps, mapDispatchToProps)(VurderingArtikkel16);
