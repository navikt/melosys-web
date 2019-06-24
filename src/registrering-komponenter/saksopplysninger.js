import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector, autofill, setSubmitFailed } from 'redux-form';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../kodeverk';
import * as Utils from '../utils';
import * as Api from '../services/api';
import * as Skjema from '../soknad-komponenter/skjema';
import * as MPT from '../proptypes';
import * as Nav from '../utils/navFrontend';
import ListevelgerFlervalg from '../komponenter/ui/listevelgerFlervalg';
import Personopplysninger from '../soknad-komponenter/personopplysninger';
import Medlemskap from '../komponenter/medlemskap';

const uuid = require('uuid/v4');

const UnntakPeriodeBegrunnelse = kode => {
  if (!kode) return '';
  return KV.kodeTilTerm(kode, MKV.KTObjects.begrunnelser.unntak_periode_begrunnelser);
};
const landTekstFormat = landObjekt => (`${landObjekt.term} (${landObjekt.kode})`);

class Saksopplysninger extends Component {
  state = {
    begrunnelseFritekst: '',
    ikkeGodkjentBegrunnelseKoder: [],
  };
  overstyrSubmit = event => {
    event.preventDefault();
  };
  textAreaOnChange = event => {
    const begrunnelseFritekst = event.target.value;
    this.setState({ begrunnelseFritekst });
  };
  submitRegistrering = () => {
    const { behandlingID, unntaksperiode, history } = this.props;
    const tilForsiden = () => history.push('/');
    switch (unntaksperiode) {
      case KV.Koder.Unntaksperiode.GODKJENT:
        Api.Saksflyt.Unntaksperioder.godkjenn(behandlingID)
          .then(tilForsiden)
          .catch(Utils.logger.error);
        return true;
      case KV.Koder.Unntaksperiode.INNHENT:
        Api.Saksflyt.Unntaksperioder.innhentinfo(behandlingID)
          .then(tilForsiden)
          .catch(Utils.logger.error);
        return true;
      case KV.Koder.Unntaksperiode.AVSLAG: {
        const ikkegodkjenn = {
          ikkeGodkjentBegrunnelseKoder: [...this.state.ikkeGodkjentBegrunnelseKoder],
          begrunnelseFritekst: this.state.begrunnelseFritekst,
        };
        Api.Saksflyt.Unntaksperioder.ikkegodkjenn(behandlingID, { ...ikkegodkjenn })
          .then(tilForsiden)
          .catch(Utils.logger.error);
        return true;
      }
      default:
        return false;
    }
  };

  render() {
    const {
      medlemskap, sed, vurderingBegrunnelser, unntaksperiode,
    } = this.props;
    if (!sed.lovvalgsperiode) {
      return null;
    }

    const { lovvalgsperiode, lovvalgsbestemmelse, lovvalgslandKode } = sed;
    const lovvalgsland = KV.kodeTilObjekt(lovvalgslandKode, MKV.KTObjects.landkoder);
    const fom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fom);
    const tom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tom);
    const inputStyle = {
      width: '110%',
    };
    const listevalgEndringHandler = event => {
      const ikkeGodkjentBegrunnelseKoder = [...event.value];
      this.setState({ ikkeGodkjentBegrunnelseKoder });
    };
    return (
      <div>
        <form name="registrering" id="registrering" onSubmit={this.overstyrSubmit}>
          <div className="stegvelger panelSeksjon">
            <div className="panel stegFane steg0 stegFane--aktiv">
              <Nav.Systemtittel>Redigering av unntaksperioder</Nav.Systemtittel>
              <br />
              <div className="vurderingEndrePeriode">
                <Nav.Undertittel>Lovvalgsperiode fra SED</Nav.Undertittel>
                <Nav.Row>
                  <Nav.Column xs="3">
                    <Nav.Input
                      bredde="XXL"
                      label="Startdato"
                      value={fom}
                      readOnly
                    />
                  </Nav.Column>
                  <Nav.Column xs="3">
                    <Nav.Input
                      style={inputStyle}
                      bredde="XXL"
                      label="Sluttdato"
                      value={tom}
                      readOnly
                    />
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="3">
                    <Nav.Input
                      bredde="XXL"
                      label="Land"
                      value={landTekstFormat(lovvalgsland)}
                      readOnly
                    />
                  </Nav.Column>
                  <Nav.Column xs="3">
                    <Nav.Input
                      style={inputStyle}
                      bredde="XXL"
                      label="Hjemmel"
                      value={lovvalgsbestemmelse}
                      readOnly
                    />
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="12">
                    <Nav.Undertittel>Treff ved registerkontroll</Nav.Undertittel>
                    <ul>
                      {vurderingBegrunnelser.begrunnelseKoder && vurderingBegrunnelser.begrunnelseKoder.map(begrunnelseKode =>
                        <li key={uuid()}>{UnntakPeriodeBegrunnelse(begrunnelseKode)}</li>)}
                    </ul>
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="3">
                    <Skjema.RadioGruppe feltNavn="unntaksperiode" label="Vurder unntaksperiode">
                      <Skjema.Radio key={uuid()} feltNavn="unntaksperiode" value={KV.Koder.Unntaksperiode.GODKJENT} label="Godkjenn" />
                      <Skjema.Radio key={uuid()} feltNavn="unntaksperiode" value={KV.Koder.Unntaksperiode.INNHENT} label="Innhent informasjon" />
                      <Skjema.Radio key={uuid()} feltNavn="unntaksperiode" value={KV.Koder.Unntaksperiode.AVSLAG} label="Ikke godkjenn" />
                    </Skjema.RadioGruppe>
                  </Nav.Column>
                </Nav.Row>
                {unntaksperiode === KV.Koder.Unntaksperiode.AVSLAG && (
                  <Fragment>
                    <Nav.Row>
                      <Nav.Column xs="6">
                        <Nav.Fieldset legend="Begrunnelse for ikke godkjent unntaksperiode">
                          <ListevelgerFlervalg
                            disabled={false}
                            muligeValg={MKV.KTObjects.begrunnelser.ikke_godkjent_begrunnelser}
                            label="Legg til begrunnelse for ikke oppfylt:"
                            tillatFritekst={false}
                            onChange={listevalgEndringHandler}
                          />
                        </Nav.Fieldset>
                      </Nav.Column>
                    </Nav.Row>
                    <Nav.Row>
                      <Nav.Column xs="6">
                        {this.state.ikkeGodkjentBegrunnelseKoder.includes('ANNET') &&
                        <Nav.Textarea
                          label="Skriv inn begrunnelse for avslaget..."
                          onChange={this.textAreaOnChange}
                          value={this.state.begrunnelseFritekst}
                          maxLength={255}
                          bredde="fullbredde" />
                        }
                      </Nav.Column>
                    </Nav.Row>
                  </Fragment>
                )}
                <Nav.Row>
                  <Nav.Column xs="3">
                    <Nav.Knapp type="hoved" onClick={() => this.submitRegistrering()}>LAGRE</Nav.Knapp>
                  </Nav.Column>
                </Nav.Row>
              </div>
            </div>
          </div>
        </form>
        <Personopplysninger redigerbart />
        {medlemskap && <Medlemskap medlemskap={medlemskap} />}
      </div>
    );
  }
}

Saksopplysninger.propTypes = {
  behandlingID: PT.number.isRequired,
  medlemskap: MPT.Medlemskap,
  sed: PT.object, // TODO prop-type
  vurderingBegrunnelser: PT.object,
  skjema: PT.any,
  unntaksperiode: PT.string,
  settFeilFelt: PT.func.isRequired,
  history: PT.object.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
};

Saksopplysninger.defaultProps = {
  medlemskap: {},
  vurderingBegrunnelser: {},
  sed: {},
  skjema: {},
  unntaksperiode: '',
};

const skjemaSelector = formValueSelector(KV.Form.SOKNAD);
const mapStateToProps = state => ({
  unntaksperiode: skjemaSelector(state, 'unntaksperiode'),
  initialValues: {
    unntaksperiode: KV.Koder.Unntaksperiode.GODKJENT,
  },
});
const mapDispatchToProps = dispatch => ({
  settFeltInnhold: (feltNavn, verdi) => dispatch(autofill(KV.Form.SOKNAD, feltNavn, verdi)),
  settFeilFelt: (...feltNavn) => (setSubmitFailed(KV.Form.SOKNAD, ...feltNavn)),
});

const SaksopplysningerForm = reduxForm({
  form: KV.Form.SOKNAD,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  onSubmit: () => {
  },
})(Saksopplysninger);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SaksopplysningerForm));
