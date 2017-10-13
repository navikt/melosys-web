import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import EkspanderbartPanel from 'nav-frontend-ekspanderbartpanel';
import { Container, Row, Column } from 'nav-frontend-grid';

import './personopplysninger.less';

class Personopplysninger extends Component {
  static propTypes = {
    tilleggsopplysninger: PT.string,
  };
  static defaultProps = {
    tilleggsopplysninger: 'Jeg håper denne søknaden kan behandles så fort som mulig. I lys av en tverrfaglig oppgaveløsning spores kompetansehevingen ' +
    'med henblikk på resultatoppnåelsen. Etter en totalvurdering av en økt målsetting forankres risikofaktorene i relasjon til beskaffenheten. I forhold til ' +
    'en bærekraftig implementering tilgjengeliggjøres forankringen innenfor rammen av ressurssituasjonen. Under forutsetning av en tiltagende avveining identifiseres ' +
    'relasjonene i forlengelsen av konseptet.',
  };

  render() {
    const { tilleggsopplysninger } = this.props;

    return (
      <div className="tilleggsopplysninger panelSeksjon">
        <EkspanderbartPanel tittel="Tilleggsopplysninger" apen>
          <Container fluid>
            {/* START TILLEGGSOPPLYSNINGER */}
            <Row>
              <Column xs="12">
                <section aria-label="Tilleggsopplysninger">
                  {tilleggsopplysninger}
                </section>
              </Column>
            </Row>
          </Container>
        </EkspanderbartPanel>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Personopplysninger);
