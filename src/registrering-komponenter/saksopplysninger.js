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
import { formSelectors } from '../ducks/form';

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
    const { behandlingID, unntaksperiode } = this.props;
    // TODO replace static data with handlier
    const ikkegodkjenn = {
      ikkeGodkjentBegrunnelseKoder: ['UTSENDELSE_OVER_24_MND', 'TREDJELANDSBORGER_IKKE_AVTALELAND', 'ANNET'],
      begrunnelseFritekst: this.state.begrunnelseFritekst,
    };
    /* eslint-disable no-console */
    switch (unntaksperiode) {
      case 'GODKJENT':
        Api.Saksflyt.Unntaksperode.godkjenn(behandlingID).then(() => {
          console.log('[PUT] successful');
        }).catch(err => console.error(err));
        return true;
      case 'INNHENT':
        Api.Saksflyt.Unntaksperode.innhentinfo(behandlingID).then(() => {
          console.log('[PUT] successful');
        }).catch(err => console.error(err));
        return true;
      case 'AVSLAG':
        Api.Saksflyt.Unntaksperode.ikkegodkjenn(behandlingID, { ...ikkegodkjenn }).then(() => {
          console.log('[POST] successful');
        }).catch(err => console.error(err));
        return true;
      default:
        return false;
    }
    /* eslint-enable no-console */
  };
  render() {
    const {
      medlemskap, sed, vurderingBegrunnelser, unntaksperiode,
    } = this.props;
    if (!sed.lovvalgsperiode) {
      return null;
    }

    const { lovvalgsperiode, lovvalgBestemmelse, lovvalgslandKode } = sed;
    const lovvalgsland = KV.kodeTilObjekt(lovvalgslandKode, MKV.KTObjects.landkoder);
    const fom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fom);
    const tom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tom);
    const inputStyle = {
      width: '110%',
    };
    return (
      <div>
        <form name="registrering" id="registrering" onSubmit={this.overstyrSubmit} >
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
                      value={lovvalgBestemmelse}
                      readOnly
                    />
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="12">
                    <Nav.Undertittel>Treff ved registerkontroll</Nav.Undertittel>
                    <ul>
                      {vurderingBegrunnelser.begrunnelseKoder && vurderingBegrunnelser.begrunnelseKoder.map(begrunnelseKode => <li key={uuid()}>{UnntakPeriodeBegrunnelse(begrunnelseKode)}</li>)}
                    </ul>
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="3">
                    <Skjema.RadioGruppe feltNavn="unntaksperiode" label="Vurder unntaksperiode">
                      <Skjema.Radio key={uuid()} feltNavn="unntaksperiode" value="GODKJENT" label="Godkjenn" />
                      <Skjema.Radio key={uuid()} feltNavn="unntaksperiode" value="INNHENT" label="Innhent informasjon" />
                      <Skjema.Radio key={uuid()} feltNavn="unntaksperiode" value="AVSLAG" label="Ikke godkjenn" />
                    </Skjema.RadioGruppe>
                  </Nav.Column>
                </Nav.Row>
                {unntaksperiode === 'AVSLAG' && (
                  <Fragment>
                    <Nav.Row>
                      <Nav.Column xs="6">
                        <Nav.Fieldset legend="Begrunnelse for ikke godkjent unntaksperiode">
                          <ListevelgerFlervalg
                            disabled={false}
                            muligeValg={MKV.KTObjects.begrunnelser.ikke_godkjent_begrunnelser}
                            label="Legg til begrunnelse for ikke oppfylt:"
                            tillatFritekst={false}
                          />
                        </Nav.Fieldset>
                      </Nav.Column>
                    </Nav.Row>
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
                <Nav.Row>
                  <Nav.Column xs="3">
                    <Nav.Knapp type="hoved" onClick={() => this.submitRegistrering()}>LAGRE</Nav.Knapp>
                  </Nav.Column>
                </Nav.Row>
              </div>
            </div>
          </div>
        </form>
        <Personopplysninger redigerbart registrering />
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
  registreringSkjemaVerdier: PT.object,
  settFeilFelt: PT.func.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
};

Saksopplysninger.defaultProps = {
  medlemskap: {},
  vurderingBegrunnelser: {},
  sed: {},
  skjema: {},
  unntaksperiode: '',
  registreringSkjemaVerdier: {},
};

const skjemaSelector = formValueSelector(KV.Form.REGISTRERING);
const mapStateToProps = state => ({
  registreringSkjemaVerdier: formSelectors.RegistreringFormSelector(state).values,
  unntaksperiode: skjemaSelector(state, 'unntaksperiode'),
  initialValues: {
    unntaksperiode: 'GODKJENT',
  },
});
const mapDispatchToProps = dispatch => ({
  settFeltInnhold: (feltNavn, verdi) => dispatch(autofill(KV.Form.REGISTRERING, feltNavn, verdi)),
  settFeilFelt: (...feltNavn) => (setSubmitFailed(KV.Form.REGISTRERING, ...feltNavn)),
});
/*
const validering = values => {
  const landkode = !values.landkode ? 'Du må velge land.' : null;
  return {
    landkode,
  };
};
*/
const SaksopplysningerForm = reduxForm({
  form: KV.Form.REGISTRERING,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  // validate: validering,
  onSubmit: () => {},
})(Saksopplysninger);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SaksopplysningerForm));
