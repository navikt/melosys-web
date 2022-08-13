import React, { Component } from "react";

import * as MPT from "../../../../proptypes";
import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";

import Tabell from "../../../tabell/tabell";
import EnkeltDato from "../../../enkeltDato";

import "./arbeidsavtaler.css";

class Arbeidsavtaler extends Component {
  state = { visHistoriskeArbeidsavtaler: false };

  toggleInntektTabellHandler = (e) => {
    e.preventDefault();
    this.setState((prevState) => ({ visHistoriskeArbeidsavtaler: !prevState.visHistoriskeArbeidsavtaler }));
  };

  render() {
    const { arbeidsavtaler } = this.props;
    const { visHistoriskeArbeidsavtaler } = this.state;

    if (!arbeidsavtaler) return null;

    const nyesteArbeidsavtale = arbeidsavtaler.length > 0 ? arbeidsavtaler[0] : {};
    const nyaa = {
      antallTimerGammeltAa: Math.trunc(nyesteArbeidsavtale.antallTimerGammeltAa),
      endringsdatoStillingsprosent: nyesteArbeidsavtale.endringsdatoStillingsprosent,
      arbeidstidsordning: KV.objektTilTerm(nyesteArbeidsavtale.arbeidstidsordning),
      yrke: KV.objektTilTerm(nyesteArbeidsavtale.yrke),
      skipsregister: KV.objektTilTerm(nyesteArbeidsavtale.skipsregister),
      skipstype: KV.objektTilTerm(nyesteArbeidsavtale.skipstype),
      fartsomraade: KV.objektTilTerm(nyesteArbeidsavtale.fartsomraade),
      beregnetAntallTimerPrUke: nyesteArbeidsavtale.beregnetAntallTimerPrUke,
    };

    const historiskeArbeidsavtaler = arbeidsavtaler.filter((arbeidsavtalen, index) => index > 0);

    const tabellTilpassetArbeidsavtaler = historiskeArbeidsavtaler.reduce((samling, arbeidsavtale) => {
      const {
        gyldigTil = "-",
        yrke,
        arbeidstidsordning,
        avtaltArbeidstimerPerUke,
        stillingsprosent,
        antallTimerGammeltAa = "-",
        endringsdatoStillingsprosent,
      } = arbeidsavtale;
      return [
        ...samling,
        [
          gyldigTil,
          yrke,
          arbeidstidsordning,
          avtaltArbeidstimerPerUke,
          antallTimerGammeltAa,
          stillingsprosent,
          <EnkeltDato dato={endringsdatoStillingsprosent} />,
        ],
      ];
    }, []);

    const visMerKnappElement =
      historiskeArbeidsavtaler.length > 0 ? (
        <Nav.Knapp mini onClick={this.toggleInntektTabellHandler} className="vistabell__knapp">
          {visHistoriskeArbeidsavtaler ? "Skjul" : "Vis"} tidligere arbeidsavtaler
        </Nav.Knapp>
      ) : null;

    const historiskeArbeidsAvtalerElement = visHistoriskeArbeidsavtaler ? (
      <div>
        <Nav.Typo.Undertittel className="arbeidsavtaler__historisk__overskrift">
          Tidligere arbeidsavtaler
        </Nav.Typo.Undertittel>
        <Tabell
          tabellData={tabellTilpassetArbeidsavtaler}
          kolonneNavn={[
            "Gyldig til",
            "Yrke",
            "Arbeidsordning",
            "Timer pr uke",
            "Timer gammelt reg.",
            "Stillingsprosent",
            "Sist endret",
          ]}
          linjerPerSide={5}
        />
      </div>
    ) : null;

    const antallTimerFraGammeltRegister = Math.trunc(nyaa.antallTimerGammeltAa);

    return (
      <div className="arbeidsavtaler">
        <div className="arbeidsavtale__nyeste">
          <Nav.Column xs="6">
            <dl className="arbeidsavtaler__detaljer">
              <dt>Yrke</dt>
              <dd>{nyaa.yrke || "-"}</dd>
              <dt>Arbeidstidsordning</dt>
              <dd>{nyaa.arbeidstidsordning || "-"}</dd>
              {nyaa.skipsregister && (
                <div>
                  <dt>Skipsregister</dt>
                  <dd>{nyaa.skipsregister}</dd>
                </div>
              )}
              {nyaa.skipstype && (
                <div>
                  <dt>Skipstype</dt>
                  <dd>{nyaa.skipstype}</dd>
                </div>
              )}
              {nyaa.fartsomraade && (
                <div>
                  <dt>Fartsområde</dt>
                  <dd>{nyaa.fartsomraade}</dd>
                </div>
              )}
            </dl>
          </Nav.Column>
          <Nav.Column xs="6">
            <dl className="arbeidsavtaler__detaljer">
              <dt>Stillingsprosent</dt>
              <dd>{Math.round(nyaa.stillingsprosent) || "-"}</dd>
              <dt>Antall timer pr uke</dt>
              <dd>{nyaa.beregnetAntallTimerPrUke ? nyaa.beregnetAntallTimerPrUke.toFixed(1) : "-"}</dd>
              <div>
                <dt>Antall timer fra gammelt register</dt>
                <dd>{antallTimerFraGammeltRegister} </dd>
              </div>
              <dt>Stillingsprosent endret</dt>
              <dd>
                <EnkeltDato dato={nyaa.endringsdatoStillingsprosent} />
              </dd>
            </dl>
          </Nav.Column>
        </div>
        {visMerKnappElement}
        {historiskeArbeidsAvtalerElement}
      </div>
    );
  }
}

Arbeidsavtaler.propTypes = {
  arbeidsavtaler: MPT.Arbeidsavtaler,
};

Arbeidsavtaler.defaultProps = {
  arbeidsavtaler: [],
};

export default Arbeidsavtaler;
