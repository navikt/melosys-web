import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../../../../kodeverk';
import * as Utils from '../../../../utils';
import * as Api from '../../../../services/api';
import * as MPT from '../../../../proptypes';
import * as Nav from '../../../../utils/navFrontend';
import * as RegistreringContext from '../state/registreringContext';
import ListevelgerFlervalg from '../../../../felleskomponenter/ui/listevelgerFlervalg';
import Medlemskap from '../../../../felleskomponenter/medlemskap';
import EndrePeriode from './endrePeriode';
import { lovvalgsperioderOperations } from '../../../../ducks/lovvalgsperioder';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../../../../ducks/avklartefakta';
import { endrePeriodeSkjema } from '../validering/endrePeriodeSkjema';
import { endrePeriodeSelectors } from '../state/ducks/endrePeriode';
import { createValidator } from '../../../../felleskomponenter/skjema/validering/skjemaer/createValidator';

import './saksopplysninger.css';
import { DatoOmradeMedVarighet } from '../../../../felleskomponenter/datoOmrade/datoOmrade';

const uuid = require('uuid/v4');

const UnntakPeriodeBegrunnelse = kode => {
  if (!kode) return '';
  return KV.kodeTilTerm(kode, MKV.KTObjects.begrunnelser.unntak_periode_begrunnelser);
};

const RegisterkontrollTreff = ({ begrunnelseKode }) => (
  <div className="registerkontroll-listeelement">
    <Nav.Ikoner kind="advarsel-sirkel-fyll" size="24" />
    <Nav.Normaltekst>{UnntakPeriodeBegrunnelse(begrunnelseKode)}</Nav.Normaltekst>
  </div>
);

RegisterkontrollTreff.propTypes = {
  begrunnelseKode: PT.string.isRequired,
};

class Saksopplysninger extends Component {
  state = {
    anmodningsperiodeSvarType: MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE,
    begrunnelseFritekst: '',
    endretPeriode: { fom: null, tom: null },
    ikkeGodkjentBegrunnelseKoder: [],
    endrePeriodeFeilmeldinger: { fom: undefined, tom: undefined, fritekst: undefined },
  };

  overstyrSubmit = event => {
    event.preventDefault();
  };
  textAreaOnChange = event => {
    const begrunnelseFritekst = event.target.value;
    this.setState({ begrunnelseFritekst });
  };
  makeResponse = () => {
    const { anmodningsperiodeSvarType, endretPeriode, begrunnelseFritekst } = this.state;
    const response = {
      anmodningsperiodeSvarType,
      endretPeriode,
      begrunnelseFritekst,
    };
    return response;
  };
  submitRegistrering = async () => {
    /* TODO
    if (!this.validerFelt()) {
      return false;
    }
*/
    const { behandlingID, history } = this.props;
    const tilForsiden = () => history.push('/');
    try {
      const anmodningsperioder = await Api.Anmodningsperioder.hent(behandlingID);
      console.log(anmodningsperioder);
      const response = this.makeResponse();
      const { id: anmodningsperiodeID } = anmodningsperioder[0];
      await Api.Anmodningsperioder.svar.send(anmodningsperiodeID, response);
    } catch (e) {
      console.log(e);
      return false;
    } finally {
      tilForsiden();
      return true;
    }

    // GET: /anmodningperioder/:behandlingID
    // POST: /anmodningsperioder/:anmodningsperiodeID/svar
    /*
 {
  "anmodningsperiodeSvarType": "INNVILGELSE",
  "endretPeriode": {
    "fom": "2017-02-01",
    "tom": "2020-01-01"
  },
  "begrunnelseFritekst": "Fritekst"
}

ved INNVILGELSE:
  endretPeriode og begrunnelseFritekst = null
ved DELVIS_INNVILGELSE
  endretPeriode ny periode i datofelt og fritekst = null
ved AVSLAG
  endretPeriode = null og begrunnelseFritekst fra fritekstfelt
     */
    // PUT: /saksflyt/anmodningsperioder/:behandlingID/svar
    // Til slutt: tilForside()
  };
  kanEndrePeriode = () => true; // TODO (this.state.unntaksperiodeVurdering === MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE);

  render() {
    const {
      medlemskap, sed, vurderingBegrunnelser, redigerbart,
    } = this.props;

    if (!sed.lovvalgsperiode) {
      return null;
    }

    const unikRadioButtonGruppeID = uuid();
    return (
      <div>
        <form name="anmodningunntak" id="anmodningunntak" onSubmit={this.overstyrSubmit}>
          <div className="stegvelger panelSeksjon">
            <div className="panel stegFane steg0 stegFane--aktiv">
              <Nav.Systemtittel>Behandle anmoding om unntak</Nav.Systemtittel>
              <br />
              <div className="vurderUnntaksperiode">
                <Nav.Row className="seksjon">
                  <Nav.Column xs="12">
                    <Nav.Element>Land:</Nav.Element>
                    <Nav.Normaltekst>{KV.kodeTilTerm(sed.lovvalgslandKode, MKV.KTObjects.landkoder)}&nbsp;({sed.lovvalgslandKode})</Nav.Normaltekst>
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row className="seksjon">
                  <Nav.Column xs="12">
                    <DatoOmradeMedVarighet periode={sed.lovvalgsperiode} label="Søknadsperiode" />
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row className="seksjon">
                  <Nav.Column xs="12">
                    <Nav.Element>Treff ved automatisk kontroll</Nav.Element>
                    {vurderingBegrunnelser.begrunnelseKoder && vurderingBegrunnelser.begrunnelseKoder.map(begrunnelseKode =>
                      <RegisterkontrollTreff key={uuid()} begrunnelseKode={begrunnelseKode} />)}
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row className="seksjon">
                  <Nav.Column xs="12">
                    <Nav.Fieldset legend="Vurder unntaksperiode" onChange={e => this.setState({ anmodningsperiodeSvarType: e.target.value })} disabled={!redigerbart}>
                      <Nav.Radio name={unikRadioButtonGruppeID} value={MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE} label={MKV.Terms.anmodningsperiodesvartyper.INNVILGELSE} defaultChecked />
                      <Nav.Radio name={unikRadioButtonGruppeID} value={MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE} label={MKV.Terms.anmodningsperiodesvartyper.DELVIS_INNVILGELSE} />
                      <Nav.Radio name={unikRadioButtonGruppeID} value={MKV.Koder.anmodningsperiodesvartyper.AVSLAG} label={MKV.Terms.anmodningsperiodesvartyper.AVSLAG} />
                    </Nav.Fieldset>
                  </Nav.Column>
                </Nav.Row>
                {this.state.anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE && (
                  <Nav.Row className="seksjon">
                    <EndrePeriode
                      feilmeldinger={this.state.endrePeriodeFeilmeldinger}
                      redigerbart={this.kanEndrePeriode()} />
                  </Nav.Row>
                )}
                {this.state.anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.AVSLAG && (
                  <Fragment>
                    <Nav.Row>
                      <Nav.Column xs="6">
                        <Nav.Textarea
                          label="Skriv inn begrunnelse for avslaget..."
                          onChange={this.textAreaOnChange}
                          value={this.state.begrunnelseFritekst}
                          maxLength={255}
                          bredde="fullbredde" />
                      </Nav.Column>
                    </Nav.Row>
                  </Fragment>
                )}
                <Nav.Row className="seksjon">
                  <Nav.Column xs="3">
                    <Nav.Hovedknapp onClick={() => this.submitRegistrering()} disabled={!redigerbart}>Bekreft og fortsett</Nav.Hovedknapp>
                  </Nav.Column>
                </Nav.Row>
              </div>
            </div>
          </div>
        </form>
        {medlemskap && <Medlemskap medlemskap={medlemskap} />}
      </div>
    );
  }
}


Saksopplysninger.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  medlemskap: MPT.Medlemskap,
  sed: MPT.Behandlinger.Saksopplysninger.SED,
  vurderingBegrunnelser: PT.object,
  skjema: PT.any,
  avklartefakta: PT.array.isRequired,
  endrePeriode: PT.object.isRequired,
  history: PT.object.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  oppdaterAvklartefakta: PT.func.isRequired,
  oppdaterLovvalgsperioder: PT.func.isRequired,
};

Saksopplysninger.defaultProps = {
  medlemskap: {},
  vurderingBegrunnelser: {},
  sed: {},
  skjema: {},
};

const mapStateToProps = state => ({
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  endrePeriode: endrePeriodeSelectors.EndrePeriodeSelector(state),
});
const mapDispatchToProps = dispatch => ({
  oppdaterAvklartefakta: (behandlingID, avklartefaktaListe) => dispatch(avklartefaktaOperations.send(behandlingID, avklartefaktaListe)),
  oppdaterLovvalgsperioder: (behandlingID, lovvalgsperiodeListe) => dispatch(lovvalgsperioderOperations.send(behandlingID, lovvalgsperiodeListe)),
});

export default withRouter(RegistreringContext.connect(mapStateToProps, mapDispatchToProps)(Saksopplysninger));
