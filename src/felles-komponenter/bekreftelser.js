import React from 'react';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';
import DatoFelt from './skjema/datofelt';

import './bekreftelser.css';

/* eslint no-unused-vars: 0 */
function Bekreftelser () {
  return (
    <div className="bekreftelser panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={Ikoner.Ferdig} tittel="Arbeidsgivers bekreftelse" undertittel="" />}
        ariaTittel="Panel for bekreftelser" >
        <Nav.Row className="bekreftelser__seksjon">
          <Nav.Column xs="12">
            <Nav.Fieldset legend="Arbeidsgiver bekrefter at arbeidstaker er utsendt?">
              <div className="skjema__horisontalefelter">
                <Nav.Radio name="arbeidsgiverBekrefterUtsendelse" label="Ja" />
                <Nav.Radio name="arbeidsgiverBekrefterUtsendelse" label="nei" />
              </div>
            </Nav.Fieldset>
            <Nav.Fieldset legend="Er arbeidstaker ansatt under utsendelsen?">
              <div className="skjema__horisontalefelter">
                <Nav.Radio name="arbeidstakerAnsattUnderUtsendelsen" label="Ja" />
                <Nav.Radio name="arbeidstakerAnsattUnderUtsendelsen" label="nei" />
              </div>
            </Nav.Fieldset>
            <Nav.Fieldset legend="Erstatter arbeidstakeren en eller flere utsendte?">
              <div className="skjema__horisontalefelter">
                <Nav.Radio name="erstatterArbeidstakerenUtsendte" label="Ja" />
                <Nav.Radio name="erstatterArbeidstakerenUtsendte" label="nei" />
              </div>
            </Nav.Fieldset>
            <Nav.Fieldset legend="Er arbeidstaker tidligere utsendt i en periode over 24 mnd?">
              <div className="skjema__horisontalefelter">
                <Nav.Radio name="arbeidstakerTidligereUtsendt24Mnd" label="Ja" />
                <Nav.Radio name="arbeidstakerTidligereUtsendt24Mnd" label="nei" />
              </div>
            </Nav.Fieldset>
            <Nav.Fieldset legend="Plikter arbeidsgiver å betale arbeidsgiveravgift?">
              <div className="skjema__horisontalefelter">
                <Nav.Radio name="arbeidsgiverBetalerArbeidsgiveravgift" label="Ja" />
                <Nav.Radio name="arbeidsgiverBetalerArbeidsgiveravgift" label="nei" />
              </div>
            </Nav.Fieldset>
            <Nav.Fieldset legend="Blir trygdeavgift trukket gjennom skatten under utenlandsoppholdet?">
              <div className="skjema__horisontalefelter">
                <Nav.Radio name="trygdeavgiftTrukketGjennomSkatt" label="Ja" />
                <Nav.Radio name="trygdeavgiftTrukketGjennomSkatt" label="nei" />
              </div>
              <DatoFelt name="trygdeavgiftTrukketGjennomSkattDato" label="Til dato:" />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}

Bekreftelser.propTypes = {
  bekreftelser: MPT.Bekreftelser,
};

Bekreftelser.defaultProps = {
  bekreftelser: {},
};

export default Bekreftelser;
