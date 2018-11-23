import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';

import EnkeltDato from './datoOmrade/enkeltDato';
import { kodeverkObjektTilTerm } from '../utils/kodeverk';
import { formatterDatoTilNorsk } from '../utils/dato';
import { fagsakSelectors } from '../ducks/fagsaker';
import { soknadSelectors } from '../ducks/soknad';

import './sideOppsummering.css';

class SideOppsummering extends Component {
  state = { status: 'VELG' };
  onChange = event => {
    const { value } = event.currentTarget;
    this.setState({ status: value });
  };

  overstyrSubmit = event => {
    event.preventDefault();
  };
  sendOppdatering = () => {
    console.log(this.state.status);
    return true;
  };

  render() {
    const {
      oppsummering,
      person,
      oppholdUtlandFom,
      oppholdUtlandTom,
      oppholdsland,
    } = this.props;

    if (!oppsummering) return <div />;
    const {
      saksnummer,
      sakstype,
      status,
      registrertDato,
      sisteOpplysningerHentetDato,
    } = oppsummering;
    const {
      fnr,
      sammensattNavn,
    } = person;
    const {
      lagreOgLukkHandle,
      oppfriskSaksopplysningerHandle,
      tilbakeleggeHandle,
    } = this.props;

    return (
      <section aria-label="oppsummeringer" className="sideOppsummering panelSeksjon">
        <Nav.Panel className="saksbehandling__soknadSammendrag">
          {/* START BEHANDLINGSMENY */}
          <Nav.Row>
            <Nav.Column xs="12" md="12">
              <div className="oppsummering__menylinje">
                <Nav.EkspanderbartpanelBase ariaTittel="Behandlingsmeny" className="oppsummering__meny" heading={<div className="behandlingsmeny_title">Behandlingsmeny</div>}>
                  <div className="meny__innhold">
                    <Nav.Knapp type="hoved" mini className="innhold__element" onClick={lagreOgLukkHandle}>Lagre og lukk</Nav.Knapp>
                    <Nav.Knapp type="hoved" mini className="innhold__element" onClick={tilbakeleggeHandle}>Legg tilbake i kø</Nav.Knapp>
                    <Nav.Knapp type="hoved" mini className="innhold__element" onClick={oppfriskSaksopplysningerHandle}>Oppfrisk saksopplysninger</Nav.Knapp>
                  </div>
                </Nav.EkspanderbartpanelBase>
              </div>
            </Nav.Column>
          </Nav.Row>
          {/* END BEHANDLINGSMENY */}
          <Nav.Row>
            <Nav.Column xs="12" md="6">
              <Nav.Undertittel className="soknadSammendrag__header">Søknad</Nav.Undertittel>
            </Nav.Column>
          </Nav.Row>
          {/* START BEHANDLINGSSTATUS */}
          <Nav.Row>
            <Nav.Column xs="12">
              <dl aria-label="behandlingsinformasjon" className="oppsummering__detaljer--rad">
                <dt>Søknadstype</dt>
                <dd>{kodeverkObjektTilTerm(sakstype)}</dd>
                <dt>Fullt navn</dt>
                <dd>{sammensattNavn}</dd>
                <dt>Fnr / dnr</dt>
                <dd>{fnr}</dd>
                <dt>Saksnummer:</dt>
                <dd>{saksnummer || '-'}</dd>
                <dt>Behandlingsstatus:</dt>
                <dd>{kodeverkObjektTilTerm(status)}</dd>
                <dt>Oppholdsland:</dt>
                <dd>{oppholdsland ? oppholdsland[0] : '-'}</dd>
                <dt>Periode</dt>
                <dd>{oppholdUtlandFom} - {oppholdUtlandTom}</dd>
                <dt>Sist oppdatert:</dt>
                <dd><EnkeltDato dato={sisteOpplysningerHentetDato} visTidspunkt /></dd>
                <dt>Registrert dato:</dt>
                <dd><EnkeltDato dato={registrertDato} /></dd>
              </dl>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12">
              <div>
                <form onSubmit={this.overstyrSubmit}>
                  <Nav.Fieldset legend="Endre status på behandling til">
                    <Nav.Select value={this.state.status} onChange={this.onChange} label="Velg begrunnelse:">
                      <option key="VELG" value="VELG">Velg...</option>
                      <option key="AVVENT_DOK_UTL" value="AVVENT_DOK_UTL">AVVENT_DOK_UTL</option>
                      <option key="AVVENT_DOK_PART" value="AVVENT_DOK_PART">AVVENT_DOK_PART</option>
                    </Nav.Select>
                  </Nav.Fieldset>
                  <Nav.Hovedknapp htmlType="submit" onClick={this.sendOppdatering}>Oppdater</Nav.Hovedknapp>
                </form>
              </div>
            </Nav.Column>
          </Nav.Row>
          {/* SLUTT BEHANDLINGSSTATUS */}
        </Nav.Panel>
      </section>
    );
  }
}

SideOppsummering.propTypes = {
  oppsummering: MPT.Oppsummering.isRequired,
  person: MPT.Person.isRequired,
  oppholdUtlandFom: PT.string.isRequired,
  oppholdUtlandTom: PT.string.isRequired,
  oppholdsland: PT.arrayOf(PT.string).isRequired,
  oppfriskSaksopplysningerHandle: PT.func.isRequired,
  lagreOgLukkHandle: PT.func.isRequired,
  tilbakeleggeHandle: PT.func.isRequired,
};

const mapStateToProps = state => ({
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  person: fagsakSelectors.PersonSelector(state),
  oppholdUtlandFom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).fom),
  oppholdUtlandTom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).tom),
  oppholdsland: soknadSelectors.OppholdsLandSelector(state),
});
const mapDispatchToProps = () => ({});
export default connect(mapStateToProps, mapDispatchToProps)(SideOppsummering);
