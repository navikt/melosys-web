import React from 'react';

import * as Nav from '../utils/navFrontend';
import * as Ikoner from '../resources/images';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './personopplysninger.css';

const info = {
  tilleggsopplysninger: 'Jeg håper denne søknaden kan behandles så fort som mulig. I lys av en tverrfaglig oppgaveløsning spores kompetansehevingen ' +
  'med henblikk på resultatoppnåelsen. Etter en totalvurdering av en økt målsetting forankres risikofaktorene i relasjon til beskaffenheten. I forhold til ' +
  'en bærekraftig implementering tilgjengeliggjøres forankringen innenfor rammen av ressurssituasjonen. Under forutsetning av en tiltagende avveining identifiseres ' +
  'relasjonene i forlengelsen av konseptet.',
};
function Personopplysninger() {
  return (
    <div className="tilleggsopplysninger panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={Ikoner.Ferdig} tittel="Tilleggsinformasjon" undertittel="" />}
        ariaTittel="Panel for tilleggsinformasjon" >
        <Nav.Container fluid>
          {/* START TILLEGGSOPPLYSNINGER */}
          <Nav.Row>
            <Nav.Column xs="12">
              <section aria-label="Tilleggsopplysninger">
                {info.tilleggsopplysninger}
              </section>
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}

export default Personopplysninger;
