import React from 'react';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import * as MPT from '../../../proptypes/';

import { avklartefaktaSelectors } from '../../../ducks/avklartefakta/';
import { soknadSelectors } from '../../../ducks/soknad/';
import { KodeverkSelectors } from '../../../ducks/kodeverk/';

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

const VurderingArtikkel16 = props => {
  const {
    alleLovvalg,
    anmodningsBegrunnelser,
    gyldigeOppholdLand,
    oppholdPeriode,
    lovvalgsunntak,
  } = props;

  const antallManeder = datoDiffMenneskelig(oppholdPeriode.fom, oppholdPeriode.tom);

  const landSomTekstListe = gyldigeOppholdLand.map(enkeltLandObjekt => enkeltLandObjekt.term).join(', ');

  return (
    <div className="vedtak">
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
            <Listevelger feltNavn="lovvalgsperiode.unntak" muligeValg={lovvalgsunntak} label="Artikkelen det søkes unntak fra:" bredde="M" />
            <Listevelger gruppe muligeValg={anmodningsBegrunnelser} feltNavn="lovvalgsperiode.begrunnelseKoder" label="Legg til begrunnelse:" />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            <Skjema.Textarea feltNavn="lovvalgsperiode.begrunnelseFritekst" label="Begrunnelse til utenlandsk myndighet (engelsk):" maxLength={200} bredde="fullbredde" />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row className="artikkel16__ekstratopp">
          <Nav.Column xs="12">
            <Nav.Fieldset legend={`Tidligere perioder i ${landSomTekstListe}:`}>
              <FieldArray name="lovvalgsperiode.tidligere" component={TidligerePerioder} alleLovvalg={alleLovvalg} />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Lenker href="http://www.nav.no">Forhåndsvis anmodning til utenlandsk myndighet</Nav.Lenker>
          </Nav.Column>
          <Nav.Column xs="12">
            <Nav.Lenker href="http://www.nav.no">Forhåndsvis brev til søker</Nav.Lenker>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row className="artikkel16__ekstratopp">
          <Nav.Column xs="6">
            <Nav.Hovedknapp type="hoved" onClick={() => {}}>Send anmodning til utenlandsk myndighet</Nav.Hovedknapp>
          </Nav.Column>
        </Nav.Row>
      </div>
    </div>
  );
};

VurderingArtikkel16.propTypes = {
  alleLovvalg: PT.arrayOf(MPT.Kodeverk).isRequired,
  lovvalgKode: PT.string.isRequired,
  gyldigeOppholdLand: MPT.OppholdLand.isRequired,
  oppholdPeriode: MPT.OppholdPeriode.isRequired,
  lovvalgsunntak: PT.arrayOf(MPT.Kodeverk).isRequired,
  anmodningsBegrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
};

const mapStateToProps = state => ({
  alleLovvalg: KodeverkSelectors.alleLovvalgSelector(state),
  lovvalgKode: avklartefaktaSelectors.AvklartefaktaLovvalgKodeSelector(state),
  gyldigeOppholdLand: avklartefaktaSelectors.AvklartefaktaGyldigeOppholdLandSelector(state),
  oppholdPeriode: soknadSelectors.OppholdUtlandPeriodeSelector(state),
  lovvalgsunntak: KodeverkSelectors.lovvalgsunntakSelector(state),
  anmodningsBegrunnelser: KodeverkSelectors.anmodningsBegrunnelserSelector(state),
});

export default connect(mapStateToProps)(VurderingArtikkel16);
