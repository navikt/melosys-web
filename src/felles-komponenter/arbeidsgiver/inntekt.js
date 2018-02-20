import React, { Component } from 'react';
import ReactHighcharts from 'react-highcharts';

import * as MPT from '../../proptypes/index';
import * as Nav from '../../utils/navFrontend';
import Tabell from '../tabell/tabell';
import * as Ikoner from '../../resources/images';

import PanelHeader from '../panelHeader/panelHeader';
import { formatterKortDatoTilNorsk } from '../../utils/dato';

import './inntekt.css';

/** Lister alle inntekter fra juridisk arbeidsgiver.
 */
class Inntekt extends Component {
  state = { visInntektTabell: false }

  toggleInntektTabellHandler = e => {
    e.preventDefault();
    this.setState({ visInntektTabell: !this.state.visInntektTabell });
  }

  render() {
    const { inntektListe } = this.props;
    /**
     * Listen over inntekt fra inntektskomponenten kan inneholde flere typer inntekter
     * i samme periode. Disse må derfor summeres slik at de representeres som én type inntekt.
     */
    const grafInntekt = inntektListe
      .reduce((samling, linje) => {
        const { utbetaltIPeriode, beskrivelse, beloep } = linje;
        const utbetaltTotaltIPeriode = samling[utbetaltIPeriode] || 0;

        return [...samling, { utbetalt: utbetaltIPeriode, beskrivelse, beloep: (utbetaltTotaltIPeriode + beloep) }];
      }, [])
      .sort((a, b) => ((a.utbetalt > b.utbetalt) ? 1 : -1));

    const grafConfig = {
      rangeSelector: {
        selected: 0,
      },
      legend: {
        enabled: false,
      },
      title: {
        text: '',
      },
      chart: {
        type: 'column',
        description: 'Grafen viser utvikling i inntekt knyttet til juridisk arbeidsgiver eller virksomhet.',
      },
      yAxis: {
        min: 0,
        title: {
          text: '',
        },
        labels: { style: { fontSize: '13px', fontWeight: 'bold' } },
      },
      xAxis: {
        categories: grafInntekt.map(linje => formatterKortDatoTilNorsk(linje.utbetalt)),
        crosshair: true,
        description: 'Perioder med inntekt.',
        labels: { style: { fontSize: '13px', fontWeight: 'bold' } },
      },
      plotOptions: {
        series: {
          stacking: 'normal',
        },
      },
      series: [
        {
          name: 'Samlet  i én periode',
          data: grafInntekt.map(linje => linje.beloep),
          color: '#0067c5',
          description: 'Inntekt',
        },
      ],
    };

    /** Basert på grafInntekt (som nå har gjort en vurdering av sikker vs usikker periode), lag en array-versjon som
     * kan serveres til Tabell-komponenten. Denne trengs for UU, men vises kun ved klikk.
     *
     * Tabell-komponenten er generisk og trenger at hver linje
     * kommer inn som en ren array og som rendres gjennomsiktig ut i GUI.
     * All formattering eller komponent-innsett må derfor gjøres her og returnere
     * en ny ferdigtygget array.
     */
    const inntektArrayed = grafInntekt
      .sort((a, b) => ((a.utbetalt < b.utbetalt) ? 1 : -1))
      .map(linje => (
        [
          formatterKortDatoTilNorsk(linje.utbetalt),
          linje.beskrivelse,
          linje.beloep,
        ]));

    const uuTabell = this.state.visInntektTabell ? (
      <div>
        <Nav.Undertittel>Inntekt</Nav.Undertittel>
        <Tabell
          kolonneNavn={['Periode', 'Beskrivelse', 'Samlet inntekt']}
          tabellData={inntektArrayed}
          linjerPerSide={5}
        />
      </div>
    ) : null;

    return inntektListe.length > 0 ? (
      <div className="inntekt panelSeksjon">
        <Nav.EkspanderbartpanelBase
          heading={<PanelHeader tittel="Inntekt" undertittel="" ikon={Ikoner.Inntekt} />}
          ariaTittel="Panel for inntekt">
          <div className="inntekt">
            <div className="inntekt__graf">
              <ReactHighcharts config={grafConfig} />
              <Nav.Knapp mini onClick={this.toggleInntektTabellHandler} className="vistabell__knapp">Vis tabell for inntekten</Nav.Knapp>
            </div>
            {uuTabell}
          </div>
        </Nav.EkspanderbartpanelBase>
      </div>
    ) : null;
  }
}

Inntekt.propTypes = {
  inntektListe: MPT.InntektListe,
};

Inntekt.defaultProps = {
  inntektListe: [],
};

export default Inntekt;
