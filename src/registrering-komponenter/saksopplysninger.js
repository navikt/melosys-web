import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { reduxForm } from 'redux-form';

import * as Utils from '../utils';
import * as MPT from '../proptypes';
import * as Nav from '../utils/navFrontend';

import Personopplysninger from '../soknad-komponenter/personopplysninger';
import Medlemskap from '../komponenter/medlemskap';
import { fagsakOperations, fagsakSelectors } from '../ducks/fagsaker';
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from '../ducks/lovvalgsperioder';
import Landvelger from '../soknad-komponenter/skjema/landvelger';

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

  render() {
    const { medlemskap, lovvalgsPeriode: { fomDato, tomDato } } = this.props;
    const formattertFomDato = Utils.dato.formatterDatoTilNorsk(fomDato);
    const formattertTomDato = Utils.dato.formatterDatoTilNorsk(tomDato);
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
                      bredde="fullbredde"
                      label="Startdato"
                      value={formattertFomDato}
                      onChange={() => {}}
                    />
                  </Nav.Column>
                  <Nav.Column xs="3">
                    <Nav.Input
                      bredde="fullbredde"
                      label="Sluttdato"
                      value={formattertTomDato}
                      onChange={() => {}}
                    />
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="3">
                    <Landvelger label="Land" feltNavn="landKode" />
                  </Nav.Column>
                  <Nav.Column xs="3">
                    <Nav.Input
                      bredde="fullbredde"
                      label="Hjemmel"
                      value=""
                      onChange={() => {}}
                    />
                  </Nav.Column>
                </Nav.Row>
              </div>
            </div>
          </div>
        </form>
        <Personopplysninger registrering />
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
};

Saksopplysninger.defaultProps = {
  inntekt: {},
  medlemskap: {},
  skjema: {},
};

const mapStateToProps = state => ({
  inntekt: fagsakSelectors.InntektSoknadenSelector(state),
  medlemskap: fagsakSelectors.MedlemskapSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  lovvalgsPeriode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
});
const mapDispatchToProps = dispatch => ({
  hentFagsaker: saksnummer => dispatch(fagsakOperations.hent(saksnummer)),
  hentLovvalgsperioder: behandlingID => dispatch(lovvalgsperioderOperations.hent(behandlingID)),
});

const SaksopplysningerForm = reduxForm({
  form: 'registrering',
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})(Saksopplysninger);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SaksopplysningerForm));
