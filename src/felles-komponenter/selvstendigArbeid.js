import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';

import * as Nav from '../utils/navFrontend';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';
import { erOrgnrGyldig } from './skjema/validering/generisk/organisasjon';
import { BOOLSK } from '../constants';

import PanelHeader from './panelHeader/panelHeader';
import OrganisasjonsAdresse from './adresser/organisasjonsAdresse';

import './selvstendigArbeid.css';
import * as formSelectors from '../ducks/form/selectors';
import { OrganisasjonSelectors, OrganisasjonOperations } from '../ducks/organisasjoner';
import * as soknadActions from '../ducks/soknad/actions';

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
      posisjon, foretaket, slettForetak, organisasjon,
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
              />
              { organisasjon && <OrganisasjonsAdresse className="enkeltforetak__adresse" organisasjon={organisasjon} /> }
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

const SelvstendigeForetak = ({
  fields, organisasjoner, hentOrganisasjon, oppdaterSoknadState, skjema,
}) => (
  <div>
    {fields.map((foretaket, index) => (
      <EnkeltForetak
        key={foretaket}
        orgnr={fields.get(index).orgnr}
        organisasjon={organisasjoner.find(organisasjon => organisasjon.orgnr === fields.get(index).orgnr) || null}
        foretaket={foretaket}
        posisjon={index + 1}
        hentOrganisasjon={hentOrganisasjon}
        slettForetak={() => fields.remove(index)}
        oppdaterSoknadState={oppdaterSoknadState}
        skjema={skjema}
      />))
    }
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
  organisasjoner: PT.array.isRequired,
  oppdaterSoknadState: PT.func.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  skjema: PT.object.isRequired,
};

const SelvstendigArbeid = props => {
  const { values: soknadVerdier } = props.soknadForm;
  const { organisasjoner, hentOrganisasjon, oppdaterSoknadState } = props;
  const { erSelvstendig } = soknadVerdier;
  const panelErRelevant = erSelvstendig === BOOLSK.SANN;

  const panelIkon = panelErRelevant ? Ikoner.Ferdig : Ikoner.Ubehandlet;

  const foretakListe = erSelvstendig === BOOLSK.SANN ?
    <FieldArray
      name="selvstendigForetak"
      component={SelvstendigeForetak}
      organisasjoner={organisasjoner}
      hentOrganisasjon={hentOrganisasjon}
      oppdaterSoknadState={oppdaterSoknadState}
      skjema={soknadVerdier}
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
  soknadForm: PT.object,
  hentOrganisasjon: PT.func.isRequired,
  organisasjoner: PT.array.isRequired,
  oppdaterSoknadState: PT.func.isRequired,
};

SelvstendigArbeid.defaultProps = {
  soknadForm: {},
};

const mapStateToProps = state => ({
  soknadForm: formSelectors.SoknadenFormSelector(state),
  organisasjoner: OrganisasjonSelectors.organisasjonerSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentOrganisasjon: orgnr => dispatch(OrganisasjonOperations.hent(orgnr)),
  oppdaterSoknadState: skjema => dispatch(soknadActions.oppdaterSoknadState(skjema)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SelvstendigArbeid);
