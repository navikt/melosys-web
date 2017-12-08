import React from 'react';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './bekreftelser.css';

function Bekreftelser (props) {
  const panelIkon = props.erValidert ? Ikoner.Ferdig : Ikoner.Varsel;

  return (
    <div className="bekreftelser panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Arbeidsgivers bekreftelse" undertittel="" />}
        ariaTittel="Panel for bekreftelser" >
        <Nav.Row className="bekreftelser__seksjon">
          <Nav.Column xs="12">
            <Skjema.RadioGruppe feltNavn="arbeidsgiverBekrefterUtsendelse" label="Arbeidsgiver bekrefter at arbeidstaker er utsendt?">
              <div className="skjema__horisontalefelter">
                <Skjema.Radio feltNavn="arbeidsgiverBekrefterUtsendelse" label="ja" value="ja" />
                <Skjema.Radio feltNavn="arbeidsgiverBekrefterUtsendelse" label="nei" value="nei" />
              </div>
            </Skjema.RadioGruppe>
            <Skjema.RadioGruppe feltNavn="arbeidstakerAnsattUnderUtsendelsen" label="Er arbeidstaker ansatt under utsendelsen?">
              <div className="skjema__horisontalefelter">
                <Skjema.Radio feltNavn="arbeidstakerAnsattUnderUtsendelsen" label="ja" value="ja" />
                <Skjema.Radio feltNavn="arbeidstakerAnsattUnderUtsendelsen" label="nei" value="nei" />
              </div>
            </Skjema.RadioGruppe>
            <Skjema.RadioGruppe feltNavn="erstatterArbeidstakerenUtsendte" label="Erstatter arbeidstakeren en eller flere utsendte?">
              <div className="skjema__horisontalefelter">
                <Skjema.Radio feltNavn="erstatterArbeidstakerenUtsendte" label="ja" value="ja" />
                <Skjema.Radio feltNavn="erstatterArbeidstakerenUtsendte" label="nei" value="nei" />
              </div>
            </Skjema.RadioGruppe>
            <Skjema.RadioGruppe feltNavn="arbeidstakerTidligereUtsendt24Mnd" label="Er arbeidstaker tidligere utsendt i en periode over 24 mnd?">
              <div className="skjema__horisontalefelter">
                <Skjema.Radio feltNavn="arbeidstakerTidligereUtsendt24Mnd" label="ja" value="ja" />
                <Skjema.Radio feltNavn="arbeidstakerTidligereUtsendt24Mnd" label="nei" value="nei" />
              </div>
            </Skjema.RadioGruppe>
            <Skjema.RadioGruppe feltNavn="arbeidsgiverBetalerArbeidsgiveravgift" label="Plikter arbeidsgiver å betale arbeidsgiveravgift?">
              <div className="skjema__horisontalefelter">
                <Skjema.Radio feltNavn="arbeidsgiverBetalerArbeidsgiveravgift" label="ja" value="ja" />
                <Skjema.Radio feltNavn="arbeidsgiverBetalerArbeidsgiveravgift" label="nei" value="nei" />
              </div>
            </Skjema.RadioGruppe>
            <Skjema.RadioGruppe feltNavn="trygdeavgiftTrukketGjennomSkatt" label="Blir trygdeavgift trukket gjennom skatten under utenlandsoppholdet?">
              <div className="skjema__horisontalefelter">
                <Skjema.Radio feltNavn="trygdeavgiftTrukketGjennomSkatt" label="ja" value="ja" />
                <Skjema.Radio feltNavn="trygdeavgiftTrukketGjennomSkatt" label="nei" value="nei" />
              </div>
            </Skjema.RadioGruppe>
            <Skjema.Input bredde="s" feltNavn="trygdeavgiftTrukketGjennomSkattDato" datoFelt label="Til dato:" />
          </Nav.Column>
        </Nav.Row>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}

Bekreftelser.propTypes = {
  bekreftelser: MPT.Bekreftelser,
  erValidert: PT.bool,
};

Bekreftelser.defaultProps = {
  bekreftelser: {},
  erValidert: false,
};

export default Bekreftelser;
