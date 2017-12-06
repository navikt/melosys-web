import React from 'react';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';

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
                <Skjema.Radio feltNavn="arbeidsgiverBekrefterUtsendelse" label="ja" value="ja" />
                <Skjema.Radio feltNavn="arbeidsgiverBekrefterUtsendelse" label="nei" value="nei" />
              </div>
            </Nav.Fieldset>
            <Nav.Fieldset legend="Er arbeidstaker ansatt under utsendelsen?">
              <div className="skjema__horisontalefelter">
                <Skjema.Radio feltNavn="arbeidstakerAnsattUnderUtsendelsen" label="ja" value="ja" />
                <Skjema.Radio feltNavn="arbeidstakerAnsattUnderUtsendelsen" label="nei" value="nei" />
              </div>
            </Nav.Fieldset>
            <Nav.Fieldset legend="Erstatter arbeidstakeren en eller flere utsendte?">
              <div className="skjema__horisontalefelter">
                <Skjema.Radio feltNavn="erstatterArbeidstakerenUtsendte" label="ja" value="ja" />
                <Skjema.Radio feltNavn="erstatterArbeidstakerenUtsendte" label="nei" value="nei" />
              </div>
            </Nav.Fieldset>
            <Nav.Fieldset legend="Er arbeidstaker tidligere utsendt i en periode over 24 mnd?">
              <div className="skjema__horisontalefelter">
                <Skjema.Radio feltNavn="arbeidstakerTidligereUtsendt24Mnd" label="ja" value="ja" />
                <Skjema.Radio feltNavn="arbeidstakerTidligereUtsendt24Mnd" label="nei" value="nei" />
              </div>
            </Nav.Fieldset>
            <Nav.Fieldset legend="Plikter arbeidsgiver å betale arbeidsgiveravgift?">
              <div className="skjema__horisontalefelter">
                <Skjema.Radio feltNavn="arbeidsgiverBetalerArbeidsgiveravgift" label="ja" value="ja" />
                <Skjema.Radio feltNavn="arbeidsgiverBetalerArbeidsgiveravgift" label="nei" value="nei" />
              </div>
            </Nav.Fieldset>
            <Nav.Fieldset legend="Blir trygdeavgift trukket gjennom skatten under utenlandsoppholdet?">
              <div className="skjema__horisontalefelter">
                <Skjema.Radio feltNavn="trygdeavgiftTrukketGjennomSkatt" label="ja" value="ja" />
                <Skjema.Radio feltNavn="trygdeavgiftTrukketGjennomSkatt" label="nei" value="nei" />
              </div>
              <DatoFelt feltNavn="trygdeavgiftTrukketGjennomSkattDato" label="Til dato:" />
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
