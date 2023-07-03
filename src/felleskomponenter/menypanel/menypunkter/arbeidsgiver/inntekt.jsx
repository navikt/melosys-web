import { Component } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";
import * as MPT from "../../../../proptypes";
import Tabell from "../../../tabell/tabell";

import "./inntekt.css";

class Inntekt extends Component {
  state = { visInntektTabell: false };

  toggleInntektTabellHandler = (e) => {
    e.preventDefault();
    this.setState((prevState) => ({ visInntektTabell: !prevState.visInntektTabell }));
  };

  render() {
    const { inntektListe } = this.props;

    if (!inntektListe) return null;

    const omvendtInntektListe = [...inntektListe].reverse();

    const options = {
      rangeSelector: {
        selected: 0,
      },
      legend: {
        enabled: false,
      },
      title: {
        text: "",
      },
      chart: {
        type: "column",
        description: "Grafen viser utvikling i inntekt knyttet til juridisk arbeidsgiver eller virksomhet.",
      },
      yAxis: {
        min: 0,
        title: {
          text: "",
        },
        labels: { style: { fontSize: "13px", fontWeight: "bold" } },
      },
      xAxis: {
        categories: inntektListe.map((linje) => Utils.dato.formatterKortDatoTilNorsk(linje.aarMaaned)),
        crosshair: true,
        description: "Perioder med inntekt.",
        labels: { style: { fontSize: "13px", fontWeight: "bold" } },
      },
      plotOptions: {
        series: {
          stacking: "normal",
        },
      },
      series: [
        {
          name: "Samlet  i én periode",
          data: inntektListe.map((linje) => linje.beloep),
          color: "#0067c5",
          description: "Inntekt",
        },
      ],
    };

    const inntektArrayed = omvendtInntektListe.map((linje) => [
      Utils.dato.formatterKortDatoTilNorsk(linje.aarMaaned),
      Utils._round(linje.beloep, 2),
    ]);

    const uuTabell = this.state.visInntektTabell ? (
      <div>
        <Nav.Typo.Undertittel>Inntekt</Nav.Typo.Undertittel>
        <Tabell kolonneNavn={["Periode", "Samlet inntekt"]} tabellData={inntektArrayed} linjerPerSide={6} />
      </div>
    ) : null;

    const harMinstEnInntekt = inntektListe.some((inntekt) => inntekt.beloep > 0);

    const inntektInnhold = harMinstEnInntekt && (
      <div className="inntekt">
        <div className="inntekt__graf">
          <HighchartsReact highcharts={Highcharts} options={options} />
          <Nav.Knapp mini onClick={this.toggleInntektTabellHandler} className="vistabell__knapp">
            {this.state.visInntektTabell ? "Skjul tabellen" : "Vis grafen som tabell"}
          </Nav.Knapp>
        </div>
        {uuTabell}
      </div>
    );

    return inntektInnhold;
  }
}

Inntekt.propTypes = {
  inntektListe: MPT.InntektListe,
};

Inntekt.defaultProps = {
  inntektListe: [],
};

export default Inntekt;
