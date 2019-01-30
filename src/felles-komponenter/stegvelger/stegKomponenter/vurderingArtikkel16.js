/* eslint-disable react/no-multi-comp */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';
import PT from 'prop-types';
import { kodeverk } from 'melosys-kodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import * as MPT from '../../../proptypes/';
import { behandlinger, brev, aktoerroller } from '../../../koder';

import { avklartefaktaSelectors } from '../../../ducks/avklartefakta/';
import { soknadSelectors } from '../../../ducks/soknad/';
import { fagsakSelectors } from '../../../ducks/fagsaker';

import { datoDiffMenneskelig, formatterDatoTilNorsk } from '../../../utils/dato';
import Listevelger from '../../skjema/listevelger';
import DatoOmrade from '../../datoOmrade/datoOmrade';
import PdfLenkeListe from '../../../felles-komponenter/pdfLenkeListe';

import './vurderingArtikkel16.css';

const uuid = require('uuid/v4');

const anmodningsBegrunnelser = kodeverk.begrunnelser.artikkel16_1_anmodning;
const alleLovvalg = kodeverk.lovvalgsbestemmelser;

const TidligereMedlemPeriodeLinje = ({
  perm, onChange, checked, redigerbart,
}) => {
  const { periodeID, periode } = perm;
  const label = `Periode: ${formatterDatoTilNorsk(periode.fom)} - ${formatterDatoTilNorsk(periode.tom)}`;

  return (
    <Fragment>
      <Nav.Checkbox disabled={!redigerbart} onChange={() => onChange(periodeID)} label={label} value="something" checked={checked} />
    </Fragment>
  );
};

TidligereMedlemPeriodeLinje.propTypes = {
  checked: PT.bool.isRequired,
  index: PT.number.isRequired,
  onChange: PT.func.isRequired,
  perm: MPT.MedlemskapEnkeltPeriode.isRequired,
  redigerbart: PT.bool.isRequired,
};

class TidligereMedlemskapPerioder extends Component {
  onChange = periodeID => {
    const { fields } = this.props;
    const { push, remove } = fields;
    const alleValgtePeriodeID = fields.getAll() || [];
    const eksistererVedPosisjon = alleValgtePeriodeID.findIndex(valgt => valgt === periodeID);

    if (eksistererVedPosisjon === -1) {
      push(periodeID);
    } else {
      remove(eksistererVedPosisjon);
    }
  };

  render() {
    const { medlemskap, fields, redigerbart } = this.props;
    const alleValgtePeriodeID = fields.getAll() || [];
    const { onChange } = this;

    const { perioderMed } = medlemskap;
    return (
      <div>
        {
          perioderMed && perioderMed.map((perm, index) => {
            const isChecked = alleValgtePeriodeID.includes(perm.periodeID);
            return <TidligereMedlemPeriodeLinje redigerbart={redigerbart} onChange={onChange} checked={isChecked} key={uuid()} perm={perm} index={index} />;
          })
        }
      </div>
    );
  }
}

TidligereMedlemskapPerioder.propTypes = {
  medlemskap: MPT.Medlemskap.isRequired,
  fields: PT.object.isRequired,
  redigerbart: PT.bool.isRequired,
};

const TidligereMedlemskap = props => (<div><FieldArray name="tidligeremedlemskap" component={TidligereMedlemskapPerioder} {...props} /></div>);


class VurderingArtikkel16 extends Component {
  lagreBehandlingerOgFatteVedtak = async behandlingsresultattype => {
    const { oppdaterOgLagreBehandlinger, lagreOgFatteVedtak } = this.props;
    await oppdaterOgLagreBehandlinger();
    await lagreOgFatteVedtak(behandlingsresultattype);
  };

  render() {
    const {
      gyldigeOppholdLand,
      oppholdPeriode,
      medlemskap,
      oppsummering,
      redigerbart,
    } = this.props;

    const { lagreBehandlingerOgFatteVedtak } = this;

    const { behandlingID } = oppsummering;

    const antallManeder = datoDiffMenneskelig(oppholdPeriode.fom, oppholdPeriode.tom);

    const landSomTekstListe = gyldigeOppholdLand.map(enkeltLandObjekt => enkeltLandObjekt.term).join(', ');

    const dokumenter = [
      { navn: 'Forhåndsvis anmodning til bruker', type: brev.ORIENTERING_ANMODNING_UNNTAK, data: { mottaker: aktoerroller.BRUKER } },
      { navn: 'Forhåndsvis anmodning til utenlandsk myndighet', type: 'SED_A001', data: { mottaker: aktoerroller.MYNDIGHET } },
    ];

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
              <Skjema.Select disabled={!redigerbart} feltNavn="lovvalgsperiode.unntakFraBestemmelse" label="Artikkelen det søkes unntak fra:" bredde="m" >
                { alleLovvalg.map(kodeObjekt => <option key={uuid()} value={kodeObjekt.kode}>{kodeObjekt.term}</option>)}
              </Skjema.Select>
              <Listevelger disabled={!redigerbart} gruppe muligeValg={anmodningsBegrunnelser} feltNavn="vilkar.art16_1_begrunnelser" label="Legg til begrunnelse:" />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12">
              <Skjema.Textarea disabled={!redigerbart} feltNavn="vilkar.art16_1_begrunnelser_fritekst" label="Begrunnelse til utenlandsk myndighet (engelsk):" maxLength={255} bredde="fullbredde" />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row className="artikkel16__ekstratopp">
            <Nav.Column xs="12">
              <Nav.Fieldset legend={`Velg direkte forutgående perioder i ${landSomTekstListe}:`}>
                <TidligereMedlemskap redigerbart={redigerbart} medlemskap={medlemskap} />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="6">
              <PdfLenkeListe behandlingID={behandlingID} dokumenter={dokumenter} />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row className="artikkel16__ekstratopp">
            <Nav.Column xs="6">
              <Nav.Hovedknapp type="hoved" disabled={!redigerbart} onClick={() => lagreBehandlingerOgFatteVedtak(behandlinger.ANMODNING_OM_UNNTAK)}>Send brevene</Nav.Hovedknapp>
            </Nav.Column>
          </Nav.Row>
        </div>
      </div>
    );
  }
}

VurderingArtikkel16.propTypes = {
  medlemskap: MPT.Medlemskap.isRequired,
  lagreOgFatteVedtak: PT.func.isRequired,
  gyldigeOppholdLand: MPT.OppholdLand.isRequired,
  oppholdPeriode: MPT.OppholdPeriode.isRequired,
  oppsummering: PT.object.isRequired,
  lovvalgKode: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  lagreBehandlinger: PT.func.isRequired,
  oppdaterOgLagreBehandlinger: PT.func.isRequired,
};

const mapStateToProps = state => ({
  gyldigeOppholdLand: avklartefaktaSelectors.AvklartefaktaGyldigeOppholdLandSelector(state),
  lovvalgKode: avklartefaktaSelectors.AvklartefaktaLovvalgKodeSelector(state),
  oppholdPeriode: soknadSelectors.OppholdUtlandPeriodeSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  medlemskap: fagsakSelectors.MedlemskapSelector(state),
});

export default connect(mapStateToProps)(VurderingArtikkel16);
