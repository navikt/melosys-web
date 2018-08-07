import React from 'react';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';

import Landvelger from './skjema/landvelger';
import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import { BOOLSK } from '../constants';

import './arbeidUtland.css';

function ArbeidUtland () {
  const panelIkon = Ikoner.Ferdig;

  return (
    <div className="arbeidsgiverUtland panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Opplysninger om arbeid i utlandet" undertittel="" />}
        ariaTittel="Panel for arbeidssted i utlandet">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="6">
              <Nav.Fieldset legend="Fysisk arbeidssted">
                <Skjema.Input label="Gateadresse" feltNavn="arbeidUtlandGatenavn" />
                <Skjema.Input label="Postnummer" feltNavn="arbeidUtlandPostnummer" />
                <Skjema.Input label="Poststed" feltNavn="arbeidUtlandPoststed" />
                <Landvelger label="Land" feltNavn="arbeidUtlandLand" />
              </Nav.Fieldset>
            </Nav.Column>
            <Nav.Column xs="6">
              <Skjema.RadioGruppe label="Oppgir søker hjemmekontor?" feltNavn="arbeidUtlandHjemmekontor">
                <Skjema.Radio feltNavn="arbeidUtlandHjemmekontor" value={BOOLSK.SANN} label="Ja" />
                <Skjema.Radio feltNavn="arbeidUtlandHjemmekontor" value={BOOLSK.USANN} label="Nei" />
              </Skjema.RadioGruppe>
              <Skjema.RadioGruppe label="Erstatter vedkommende en tidligere utsendt?" feltNavn="arbeidUtlandErstatning">
                <Skjema.Radio feltNavn="arbeidUtlandErstatning" value={BOOLSK.SANN} label="Ja" />
                <Skjema.Radio feltNavn="arbeidUtlandErstatning" value={BOOLSK.USANN} label="Nei" />
              </Skjema.RadioGruppe>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="6">
              <Nav.Fieldset legend="Arbeidsandel i prosent">
                <Skjema.Input bredde="XS" type="number" feltNavn="arbeidsandelUtland" label="Arbeidsandel utland, oppgitt i søknad" />
                <Skjema.Input bredde="XS" type="number" feltNavn="arbeidsandelNorge" label="Arbeidsandel Norge, oppgitt i søknad" />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}

ArbeidUtland.propTypes = {
  organisasjoner: MPT.Organisasjoner,
};

ArbeidUtland.defaultProps = {
  organisasjoner: [],
};

export default ArbeidUtland;
