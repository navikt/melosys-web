import React, { Component } from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';

import * as Nav from '../utils/navFrontend';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';
import * as API from '../services/api';
import { erOrgnrGyldig } from './skjema/validering/generisk/organisasjon';
import { BOOLSK } from '../constants';

import PanelHeader from './panelHeader/panelHeader';
import OrganisasjonsAdresse from './adresser/organisasjonsadresse';

import './selvstendigArbeid.css';

class EnkeltForetak extends Component {
  state = { organisasjon: {} }

  componentDidMount() {
    const { orgnr } = this.props;
    if (orgnr) this.hentOrganisasjon(orgnr);
  }

  hentOrganisasjon = orgnr => {
    if (orgnr && erOrgnrGyldig(orgnr)) {
      API.Organisasjoner.hentOrganisasjon(orgnr).then(response => {
        const organisasjon = Object.keys(response).length >= 0 ? response : false;
        this.setState({ organisasjon });
      });
    }
  }

  inputKeyHandler = event => this.hentOrganisasjon(event.target.value);

  render () {
    const { posisjon, foretaket, slettForetak } = this.props;
    const { inputKeyHandler } = this;
    const feilmelding = !this.state.organisasjon ? { feilmelding: 'Fant ikke virksomheten.' } : null;

    return (
      <div className="enkeltForetak">
        <Nav.Fieldset legend={`Foretak #${posisjon}`}>
          <Nav.Row>
            <Nav.Column xs="4">
              <Skjema.Input feltNavn={`${foretaket}.orgnr`} feil={feilmelding} bredde="S" label="Organisasjonsnummer" onKeyUp={inputKeyHandler} />
              { this.state.organisasjon && <OrganisasjonsAdresse className="enkeltforetak__adresse" organisasjon={this.state.organisasjon} /> }
            </Nav.Column>
            <Nav.Column xs="5">
              <label>Oppgir at virksomheten fortsetter etter arbeid i utlandet:
                <div>
                  <Skjema.Radio feltNavn={`${foretaket}.fortsetterEtterArbeidIUtlandet`} value={BOOLSK.SANN} label="Ja" />
                  <Skjema.Radio feltNavn={`${foretaket}.fortsetterEtterArbeidIUtlandet`} value={BOOLSK.USANN} label="Nei" />
                </div>
              </label>
            </Nav.Column>
            <Nav.Column xs="3">
              <Nav.Knapp mini onClick={slettForetak}>Fjern</Nav.Knapp>
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>
      </div>
    );
  }
}

EnkeltForetak.propTypes = {
  posisjon: PT.number.isRequired,
  foretaket: PT.string.isRequired,
  slettForetak: PT.func.isRequired,
  orgnr: PT.string,
};

EnkeltForetak.defaultProps = {
  orgnr: null,
};

const SelvstendigeForetak = ({ fields }) => (
  <div>
    {fields.map((foretaket, index) => <EnkeltForetak key={foretaket} orgnr={fields.get(index).orgnr} foretaket={foretaket} posisjon={index + 1} slettForetak={() => fields.remove(index)} />)}
    <div className="leggTilForetak">
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Knapp mini onClick={() => fields.push({})}>Legg til nytt foretak</Nav.Knapp>
        </Nav.Column>
      </Nav.Row>
    </div>
  </div>
);

SelvstendigeForetak.propTypes = {
  fields: PT.object.isRequired,
};

const SelvstendigArbeid = props => {
  const { erSelvstendig } = props.soknadVerdier;
  const panelErRelevant = erSelvstendig === BOOLSK.SANN;

  const panelIkon = panelErRelevant ? Ikoner.Ferdig : Ikoner.Ubehandlet;

  const foretakListe = erSelvstendig === BOOLSK.SANN ?
    <FieldArray
      name="selvstendigForetak"
      component={SelvstendigeForetak}
    />
    : null;

  return (
    <div className="selvstendigArbeid panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Arbeid som selvstendig næringsdrivende" undertittel="" />}
        ariaTittel="Arbeid som selvstendig næringsdrivende">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="12">
              <Skjema.RadioGruppe feltNavn="erSelvstendig" label="Oppgir søker at han eller hun jobber som selvstendig næringsdrivende?">
                <Skjema.Radio feltNavn="erSelvstendig" value={BOOLSK.SANN} label="Ja" />
                <Skjema.Radio feltNavn="erSelvstendig" value={BOOLSK.USANN} label="Nei" />
              </Skjema.RadioGruppe>
            </Nav.Column>
          </Nav.Row>
          { foretakListe }
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
};

SelvstendigArbeid.propTypes = {
  soknadVerdier: PT.object,
};

SelvstendigArbeid.defaultProps = {
  soknadVerdier: {},
};

export default SelvstendigArbeid;
