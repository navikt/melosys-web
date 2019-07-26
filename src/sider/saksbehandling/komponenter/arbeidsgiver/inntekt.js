import React, { Component } from 'react';
import ReactHighcharts from 'react-highcharts';

import * as MPT from '../../../../proptypes';
import * as Nav from '../../../../utils/navFrontend';
import Tabell from '../../../../felleskomponenter/tabell/tabell';
import * as Ikoner from '../../../../resources/images';

import PanelHeader from '../../../../felleskomponenter/panelHeader/panelHeader';
import { formatterKortDatoTilNorsk } from '../../../../utils/dato';

import './inntekt.css';

/** Lister alle inntekter fra juridisk arbeidsgiver.
 */
class Inntekt extends Component {
  state = { visInntektTabell: false };

  toggleInntektTabellHandler = e => {
    e.preventDefault();
    this.setState({ visInntektTabell: !this.state.visInntektTabell });
  };

  render() {
    const { inntektListe } = this.props;

    if (!inntektListe) return null;

    const omvendtInntektListe = [...inntektListe].reverse();

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
        categories: inntektListe.map(linje => formatterKortDatoTilNorsk(linje.aarMaaned)),
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
          data: inntektListe.map(linje => linje.beloep),
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
    const inntektArrayed = omvendtInntektListe
      .map(linje => (
        [
          formatterKortDatoTilNorsk(linje.aarMaaned),
          linje.beloep,
        ]));

    const uuTabell = this.state.visInntektTabell ? (
      <div>
        <Nav.Undertittel>Inntekt</Nav.Undertittel>
        <Tabell
          kolonneNavn={['Periode', 'Samlet inntekt']}
          tabellData={inntektArrayed}
          linjerPerSide={6}
        />
      </div>
    ) : null;

    const harMinstEnInntekt = inntektListe.some(inntekt => inntekt.beloep > 0);

    const inntektInnhold = harMinstEnInntekt && (
      <div className="inntekt">
        <div className="inntekt__graf">
          <ReactHighcharts config={grafConfig} />
          <Nav.Knapp mini onClick={this.toggleInntektTabellHandler} className="vistabell__knapp">
            { this.state.visInntektTabell ? 'Skjul tabellen' : 'Vis grafen som tabell' }
          </Nav.Knapp>
        </div>
        {uuTabell}
      </div>
    );

    const manglerInntektTekst = !harMinstEnInntekt && 'Ingen inntekt i arbeidsforholdet 6 måneder forut for søknadsperioden.';

    return (
      <div className="inntekt panelSeksjon">
        <Nav.EkspanderbartpanelBase
          heading={<PanelHeader tittel="Inntekt" undertittel={manglerInntektTekst} ikon={Ikoner.Inntekt} />}
          ariaTittel="Panel for inntekt">
          { inntektInnhold }
        </Nav.EkspanderbartpanelBase>
      </div>);
  }
}

Inntekt.propTypes = {
  inntektListe: MPT.InntektListe,
};

Inntekt.defaultProps = {
  inntektListe: [],
};

export default Inntekt;
