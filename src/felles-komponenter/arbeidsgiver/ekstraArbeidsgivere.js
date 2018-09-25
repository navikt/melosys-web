import React, { Component, Fragment } from 'react';

import * as Nav from '../../utils/navFrontend';
import * as API from '../../services/api';
import OrganisasjonsAdresse from '../adresser/organisasjonsAdresse';
import Organisasjon from './organisasjon';

import './ekstraArbeidsgivere.css';
import { erOrgnrGyldig } from '../skjema/validering/generisk/organisasjon';

const FunnetOrganisasjon = ({ leggTil, organisasjon }) => {
  return (
    <Fragment>
      <OrganisasjonsAdresse organisasjon={organisasjon} />
      <Nav.Knapp onClick={() => leggTil(organisasjon.orgnr)}>Legg til</Nav.Knapp>
    </Fragment>
  );
};

class ArbeidsgiverEnkelt extends Component {
  state = { organisasjon: null }

  componentDidMount() {
    this.hentOrganisasjon(this.props.orgnr);
  }

  hentOrganisasjon = orgnr => {
    API.Organisasjoner.hentOrganisasjon(orgnr).then(response => {
      this.setState({ organisasjon: response });
    });
  };

  slettHandle = () => {

  };

  render() {
    const { organisasjon } = this.state;
    const { slettHandle } = this;

    return (organisasjon && <Organisasjon organisasjon={organisasjon} erManuell slettHandle={slettHandle} />);
  }
}

/** Dette er komponenten for ett enkelt Arbeidsforhold. Denne eksporteres ikke til omverden, men brukes
 * kun av komponenten Arbeidsforholdene.
 *
 * @param props Et objekt med det aktuelle arbeidsforholdet.
 */
class EkstraArbeidsgivere extends Component {
  state = {
    visLeggTil: false, organisasjon: null, orgnr: '', feilmelding: null,
  };

  settFeilmelding = feilmelding => this.setState({ feilmelding });
  settOrganisasjon = organisasjon => this.setState({ organisasjon });

  forsokHentOrganisasjon = () => {
    // 943049467
    const { orgnr } = this.state;

    if (erOrgnrGyldig(orgnr)) {
      this.props.hentOrganisasjon(orgnr).then(response => {
        const { data: organisasjon } = response;
        const feilmelding = !organisasjon ? 'Fant ikke organisasjonen' : null;
        this.settOrganisasjon(organisasjon);
        this.settFeilmelding(feilmelding);
      });
    }
  };

  leggTil = orgnr => {
    const { fields } = this.props;
    fields.push(orgnr);
  };

  slett = indeks => {

  };

  toggleVisLeggTil = () => {
    this.setState({ visLeggTil: !this.state.visLeggTil });
  };

  oppdaterOrgnrHandle = event => {
    const { value } = event.target;
    this.setState({ orgnr: value });
    this.settFeilmelding(null);
    this.settOrganisasjon(null);
  };

  render () {
    const {
      toggleVisLeggTil, oppdaterOrgnrHandle, leggTil, forsokHentOrganisasjon,
    } = this;
    const { orgnr } = this.state;
    const { fields } = this.props;

    const alleEkstraArbeidsgivere = fields.getAll() || [];

    return (
      <div className="panelSeksjon manuellArbeidsgiver">
        {alleEkstraArbeidsgivere.map(arbeidsgiverOrg => <ArbeidsgiverEnkelt key={arbeidsgiverOrg} orgnr={arbeidsgiverOrg} />)}
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="12">
              {!this.state.visLeggTil && <Nav.Knapp onClick={toggleVisLeggTil}>+ Legg til arbeidsgiver fra Aa-reg</Nav.Knapp> }
              {this.state.visLeggTil && (
                <Nav.Panel>
                  <div className="leggTilArbeidsgiver__knapper">
                    <Nav.Input
                      value={orgnr}
                      onChange={oppdaterOrgnrHandle}
                      label="Søk etter orgnr / fnr"
                      feil={this.state.feilmelding}
                    />
                    <Nav.Knapp onClick={forsokHentOrganisasjon}>Søk</Nav.Knapp>
                  </div>
                  <div>
                    {this.state.organisasjon && <FunnetOrganisasjon organisasjon={this.state.organisasjon} leggTil={leggTil} />}
                  </div>
                </Nav.Panel>)
              }
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </div>
    );
  }
}

EkstraArbeidsgivere.propTypes = {};

export default EkstraArbeidsgivere;
