import React from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';

import * as Nav from '../utils/navFrontend';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';

import { BOOLSK } from '../constants';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './selvstendigArbeid.css';

const EnkeltForetak = props => {
  const { nummer, foretaket } = props;

  return (
    <div className="enkeltForetak">
      <Nav.Fieldset legend={`Foretak #${nummer}`}>
        <Nav.Row>
          <Nav.Column xs="4">
            <Skjema.Input feltNavn={`${foretaket}.orgnr`} bredde="S" label="Organisasjonsnummer" />
            <div className="enkeltforetak__adresse">Multisoft AS, Adresseveien 123, 2343 Rørvik</div>
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
            <Nav.Knapp mini>Fjern</Nav.Knapp>
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>
    </div>
  );
};

EnkeltForetak.propTypes = {
  nummer: PT.number.isRequired,
  foretaket: PT.string.isRequired,
};

const SelvstendigeForetak = props => {
  const { fields } = props;

  return (
    <div>
      {fields.map((foretaket, index) => <EnkeltForetak key={foretaket} foretaket={foretaket} nummer={index + 1} />)}
      <div className="leggTilForetak">
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Knapp mini>Legg til nytt foretak</Nav.Knapp>
          </Nav.Column>
        </Nav.Row>
      </div>
    </div>
  );
};

SelvstendigeForetak.propTypes = {
  fields: PT.object.isRequired,
};

const SelvstendigArbeid = props => {
  const { erSelvstendig } = props.soknadVerdier;
  const panelErRelevant = erSelvstendig === BOOLSK.SANN;

  const panelIkon = panelErRelevant ? Ikoner.Ferdig : Ikoner.Ubehandlet;

  const selvstendigArbeidListe = erSelvstendig === BOOLSK.SANN ? <FieldArray
    name="selvstendigForetak"
    component={SelvstendigeForetak}
  /> : null;

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
          { selvstendigArbeidListe }
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
