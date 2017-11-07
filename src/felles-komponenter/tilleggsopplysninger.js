import React from 'react';
import * as Nav from '../utils/navFrontend';

import './personopplysninger.less';

const info = {
  tilleggsopplysninger: 'Jeg håper denne søknaden kan behandles så fort som mulig. I lys av en tverrfaglig oppgaveløsning spores kompetansehevingen ' +
  'med henblikk på resultatoppnåelsen. Etter en totalvurdering av en økt målsetting forankres risikofaktorene i relasjon til beskaffenheten. I forhold til ' +
  'en bærekraftig implementering tilgjengeliggjøres forankringen innenfor rammen av ressurssituasjonen. Under forutsetning av en tiltagende avveining identifiseres ' +
  'relasjonene i forlengelsen av konseptet.',
};
function Personopplysninger() {
  return (
    <div className="tilleggsopplysninger panelSeksjon">
      <Nav.EkspanderbartPanel tittel="Tilleggsopplysninger">
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
      </Nav.EkspanderbartPanel>
    </div>
  );
}

export default Personopplysninger;
