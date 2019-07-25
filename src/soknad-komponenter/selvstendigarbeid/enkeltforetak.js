import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as Skjema from '../../felleskomponenter/skjema';

import { behandlingerSelectors } from '../../ducks/behandlinger';
import { erOrgnrGyldig } from '../../felleskomponenter/skjema/validering/generisk/organisasjon';
import { BOOLSK } from '../../constants';

import OrganisasjonsAdresse from '../../felleskomponenter/adresser/organisasjonsAdresse';

import './selvstendigArbeid.css';

class EnkeltForetak extends Component {
  state = { feilmelding: null };

  async componentDidMount() {
    const { orgnr, organisasjon, hentOrganisasjon } = this.props;
    if (!organisasjon && orgnr) { await hentOrganisasjon(orgnr); }
  }

  async componentDidUpdate(prevProps) {
    const { settFeilmelding } = this;
    const { hentOrganisasjon, skjema } = this.props;
    const gammeltOrgnr = prevProps.orgnr;
    const nyttOrgnr = this.props.orgnr;

    if (gammeltOrgnr === nyttOrgnr) { return; }
    settFeilmelding('');

    if (erOrgnrGyldig(nyttOrgnr)) {
      await hentOrganisasjon(nyttOrgnr);
      this.props.oppdaterSoknadState(skjema);
    }
  }

  settFeilmelding = feilmelding => this.setState({ feilmelding });

  presjekkOrganisasjon = () => {
    const { orgnr } = this.props;
    if (!erOrgnrGyldig(orgnr)) { this.settFeilmelding('Organisasjonsnummer er ikke gyldig.'); }
  };

  render () {
    const {
      redigerbart, posisjon, foretaket, slettForetak, organisasjon,
    } = this.props;
    const feilmelding = this.state.feilmelding ? { feilmelding: this.state.feilmelding } : null;

    return (
      <div className="enkeltForetak">
        <Nav.Fieldset legend={`Foretak #${posisjon}`}>
          <Nav.Row>
            <Nav.Column xs="4">
              <Skjema.Input
                feltNavn={`${foretaket}.orgnr`}
                feil={feilmelding}
                bredde="S"
                label="Organisasjonsnummer"
                onBlur={() => this.presjekkOrganisasjon()}
                disabled={!redigerbart}
              />
              {
                organisasjon && <OrganisasjonsAdresse className="enkeltforetakAdresse" organisasjon={organisasjon} />
              }
            </Nav.Column>
            <Nav.Column xs="5">
              <label>Oppgir at virksomheten fortsetter etter arbeid i utlandet:
                <div>
                  <Skjema.Radio feltNavn={`${foretaket}.fortsetterEtterArbeidIUtlandet`} value={BOOLSK.SANN} label="Ja" disabled={!redigerbart} />
                  <Skjema.Radio feltNavn={`${foretaket}.fortsetterEtterArbeidIUtlandet`} value={BOOLSK.USANN} label="Nei" disabled={!redigerbart} />
                </div>
              </label>
            </Nav.Column>
            <Nav.Column xs="3">
              <Nav.Knapp disabled={!redigerbart} mini onClick={slettForetak}>Fjern</Nav.Knapp>
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>
      </div>
    );
  }
}

EnkeltForetak.propTypes = {
  redigerbart: PT.bool.isRequired,
  foretaket: PT.string.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  organisasjon: PT.object,
  orgnr: PT.string,
  oppdaterSoknadState: PT.func.isRequired,
  posisjon: PT.number.isRequired,
  slettForetak: PT.func.isRequired,
  skjema: PT.object.isRequired,
};

EnkeltForetak.defaultProps = {
  orgnr: null,
  organisasjon: null,
};

const mapStateToProps = state => ({
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(EnkeltForetak);
