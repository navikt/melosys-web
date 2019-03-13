import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector, autofill, setSubmitFailed } from 'redux-form';
import PT from 'prop-types';

import * as KV from '../kodeverk';
import * as Utils from '../utils';
import * as Api from '../services/api';
import * as Skjema from '../soknad-komponenter/skjema';
import * as MPT from '../proptypes';
import * as Nav from '../utils/navFrontend';

import Personopplysninger from '../soknad-komponenter/personopplysninger';
import Medlemskap from '../komponenter/medlemskap';
import { fagsakOperations, fagsakSelectors } from '../ducks/fagsaker';
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from '../ducks/lovvalgsperioder';
import Landvelger from '../soknad-komponenter/skjema/landvelger';
import * as Dato from '../soknad-komponenter/skjema/validering/generisk/dato';
import { formSelectors } from '../ducks/form';

const datoErIkkeGyldig = dato => (!Dato.datoErGyldig(dato) ? 'Skriv inn en gyldig dato' : false);
const datoErBlank = dato => ((!dato || dato === '') ? 'Tast inn dato' : false);

const erSkjemaGyldig = verdier => {
  const startDato = (
    datoErIkkeGyldig(verdier.startdato) ||
    datoErBlank(verdier.startdato) ||
    false
  );
  const sluttDato = (
    datoErIkkeGyldig(verdier.sluttdato) ||
    datoErBlank(verdier.sluttdato) ||
    false
  );
  const validators = {
    startDato,
    sluttDato,
  };
  return Object.values(validators).every(enkeltValidering => enkeltValidering === false);
};

class Saksopplysninger extends Component {
  async componentDidMount() {
    await this.lastInnSaksopplysninger();
  }

  lastInnSaksopplysninger= async () => {
    const { hentFagsaker, hentLovvalgsperioder } = this.props;
    await hentFagsaker(4);
    await hentLovvalgsperioder(4);
  };

  overstyrSubmit = event => {
    event.preventDefault();
  };
  submitRegistrering = () => {
    const { registreringSkjemaVerdier, settFeilFelt } = this.props;
    if (!erSkjemaGyldig(registreringSkjemaVerdier)) {
      settFeilFelt('landKode', 'startdato', 'sluttdato', 'hjemmel');
      return false;
    }
    const {
      landKode, startdato, sluttdato, hjemmel,
    } = this.props;
    const unntaksperiode = {
      landKode, startdato, sluttdato, hjemmel,
    };
    Api.Registrering.unntaksperioder(4, unntaksperiode)
      .then(() => {
        console.log('[POST] successful');
      })
      .catch(err => console.error(err));
    return true;
  };
  render() {
    const { medlemskap } = this.props;
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
                    <Skjema.Input datoFelt label="Startdato" feltNavn="startdato" />
                  </Nav.Column>
                  <Nav.Column xs="3">
                    <Skjema.Input datoFelt label="Sluttdato" feltNavn="sluttdato" />
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="3">
                    <Landvelger label="Land" feltNavn="landKode" />
                  </Nav.Column>
                  <Nav.Column xs="3">
                    <Skjema.Input label="Hjemmel" feltNavn="hjemmel" />
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="3">
                    <Nav.Knapp onClick={() => this.submitRegistrering()}>GODKJENN</Nav.Knapp>
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
  hentFagsaker: PT.func.isRequired,
  hentLovvalgsperioder: PT.func.isRequired,
  inntekt: MPT.Inntekt,
  medlemskap: MPT.Medlemskap,
  oppsummering: MPT.Oppsummering.isRequired,
  lovvalgsPeriode: PT.object.isRequired,
  skjema: PT.any,
  landKode: PT.string,
  startdato: PT.string,
  sluttdato: PT.string,
  hjemmel: PT.string,
  registreringSkjemaVerdier: PT.object,
  settFeilFelt: PT.func.isRequired,
};

Saksopplysninger.defaultProps = {
  inntekt: {},
  medlemskap: {},
  skjema: {},
  landKode: '',
  startdato: '',
  sluttdato: '',
  hjemmel: '',
  registreringSkjemaVerdier: {},
};

const skjemaSelector = formValueSelector(KV.Form.REGISTRERING);
const mapStateToProps = state => ({
  registreringSkjemaVerdier: formSelectors.RegistreringFormSelector(state).values,
  inntekt: fagsakSelectors.InntektSoknadenSelector(state),
  medlemskap: fagsakSelectors.MedlemskapSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  lovvalgsPeriode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
  landKode: skjemaSelector(state, 'landKode'),
  startdato: skjemaSelector(state, 'startdato'),
  sluttdato: skjemaSelector(state, 'sluttdato'),
  hjemmel: skjemaSelector(state, 'hjemmel'),
  initialValues: {
    startdato: Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.LovvalgsperiodeSelector(state).fomDato),
    sluttdato: Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.LovvalgsperiodeSelector(state).tomDato),
    landKode: 'NO',
    hjemmel: 'Hva er hjemmel?',
  },
});
const mapDispatchToProps = dispatch => ({
  settFeltInnhold: (feltNavn, verdi) => dispatch(autofill(KV.Form.REGISTRERING, feltNavn, verdi)),
  settFeilFelt: (...feltNavn) => (setSubmitFailed(KV.Form.REGISTRERING, ...feltNavn)),
  hentFagsaker: saksnummer => dispatch(fagsakOperations.hent(saksnummer)),
  hentLovvalgsperioder: behandlingID => dispatch(lovvalgsperioderOperations.hent(behandlingID)),
});

const datoValidering = (values, feltnavn) => (
  datoErIkkeGyldig(values[feltnavn]) ||
  datoErBlank(values[feltnavn]) ||
  false
);

const validering = values => {
  const startdato = datoValidering(values, 'startdato') || null;
  const sluttdato = datoValidering(values, 'sluttdato') || null;
  const landKode = !values.landKode ? 'Du må velge land.' : null;
  return {
    startdato,
    sluttdato,
    landKode,
  };
};

const SaksopplysningerForm = reduxForm({
  form: KV.Form.REGISTRERING,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: validering,
  onSubmit: () => {},
})(Saksopplysninger);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SaksopplysningerForm));
