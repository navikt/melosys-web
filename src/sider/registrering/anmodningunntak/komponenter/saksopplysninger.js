import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../../../../kodeverk';
// import * as Utils from '../../../../utils';
import * as Api from '../../../../services/api';
import * as MPT from '../../../../proptypes';
import * as Nav from '../../../../utils/navFrontend';
import * as RegistreringContext from '../../state/registreringContext';
import Medlemskap from '../../../../felleskomponenter/medlemskap';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../../../../ducks/avklartefakta';

import './saksopplysninger.css';
import { DatoOmradeMedVarighet } from '../../../../felleskomponenter/datoOmrade/datoOmrade';
import * as Utils from '../../../../utils';

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
    endretPeriodeFom: null,
    endretPeriodeTom: null,
    endrePeriodeFeilmeldinger: { fom: undefined, tom: undefined, fritekst: undefined },
  };
  UNSAFE_componentWillReceiveProps() {
    const { sed } = this.props;
    if (sed && sed.lovvalgsperiode) {
      this.setState({
        endretPeriodeFom: Utils.dato.formatterDatoTilNorsk(sed.lovvalgsperiode.fom),
        endretPeriodeTom: Utils.dato.formatterDatoTilNorsk(sed.lovvalgsperiode.tom),
      });
    }
  }

  overstyrSubmit = event => {
    event.preventDefault();
  };
  textAreaOnChange = event => {
    const begrunnelseFritekst = event.target.value;
    this.setState({ begrunnelseFritekst });
  };

  makeResponse = (endretPeriode = null, begrunnelseFritekst = null) => {
    const { anmodningsperiodeSvarType } = this.state;
    const response = {
      anmodningsperiodeSvarType,
      endretPeriode,
      begrunnelseFritekst,
    };
    return response;
  };

  submitRegistrering = async () => {
    const { behandlingID, history } = this.props;
    const tilForsiden = () => history.push('/');
    const { anmodningsperiodeSvarType, begrunnelseFritekst } = this.state;
    const { INNVILGELSE, DELVIS_INNVILGELSE, AVSLAG } = MKV.Koder.anmodningsperiodesvartyper;
    let response;
    switch (anmodningsperiodeSvarType) {
      case INNVILGELSE:
        response = this.makeResponse(null, null);
        break;
      case DELVIS_INNVILGELSE:
        response = this.makeResponse({
          fom: Utils.dato.formatterDatoTilISO(this.state.endretPeriodeFom),
          tom: Utils.dato.formatterDatoTilISO(this.state.endretPeriodeTom),
        }, null);
        break;
      case AVSLAG:
        response = this.makeResponse(null, begrunnelseFritekst);
        break;
      default:
        break;
    }
    try {
      const data = await Api.Anmodningsperioder.hent(behandlingID);
      const { anmodningsperioder } = data;
      const anmodningsperiodeID = anmodningsperioder[0].id;
      //await Api.Anmodningsperioder.svar.send(anmodningsperiodeID, response);
      await Api.Registrering.anmodningunntak.send(behandlingID, response);
    } catch (e) {
      Utils.logger.error(e);
      return false;
    } finally {
      tilForsiden();
    }
    return true;
  };

  formaterFom = event => {
    const nyDato = Utils.dato.vaskInputDato(event.target.value);
    this.setState({ endretPeriodeFom: nyDato });
  };

  formaterTom = event => {
    const nyDato = Utils.dato.vaskInputDato(event.target.value);
    this.setState({ endretPeriodeTom: nyDato });
  };

  render() {
    const {
      medlemskap, sed, vurderingBegrunnelser, redigerbart,
    } = this.props;

    if (!sed.lovvalgsperiode) {
      return null;
    }
    const { endretPeriodeFom, endretPeriodeTom, endrePeriodeFeilmeldinger } = this.state;
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
                    <div className="endre_periode">
                      <Nav.Column xs="3">
                        <Nav.Input
                          bredde="fullbredde"
                          label="Startdato"
                          value={endretPeriodeFom}
                          onChange={e => this.setState({ endretPeriodeFom: e.target.value })}
                          onBlur={e => this.formaterFom(e)}
                          feil={endrePeriodeFeilmeldinger.fom}
                          disabled={!redigerbart} />
                      </Nav.Column>
                      <Nav.Column xs="3">
                        <Nav.Input
                          bredde="fullbredde"
                          label="Sluttdato"
                          value={endretPeriodeTom}
                          onChange={e => this.setState({ endretPeriodeTom: e.target.value })}
                          onBlur={e => this.formaterTom(e)}
                          feil={endrePeriodeFeilmeldinger.tom}
                          disabled={!redigerbart} />
                      </Nav.Column>
                    </div>
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
  history: PT.object.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  oppdaterAvklartefakta: PT.func.isRequired,
};

Saksopplysninger.defaultProps = {
  medlemskap: {},
  vurderingBegrunnelser: {},
  sed: {},
  skjema: {},
};

const mapStateToProps = state => ({
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
});
const mapDispatchToProps = dispatch => ({
  oppdaterAvklartefakta: (behandlingID, avklartefaktaListe) => dispatch(avklartefaktaOperations.send(behandlingID, avklartefaktaListe)),
});

export default withRouter(RegistreringContext.connect(mapStateToProps, mapDispatchToProps)(Saksopplysninger));
