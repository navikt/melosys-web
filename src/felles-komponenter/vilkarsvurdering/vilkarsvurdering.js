import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Checkbox, Radio, Fieldset } from 'nav-frontend-skjema';
import { Innholdstittel } from 'nav-frontend-typografi';

import StegVelger from './komponenter/stegVelger';
import StegFane from './komponenter/stegFane';
import './vilkarsvurdering.css';

import ikonUbehandlet from '../../resources/images/ikon-steg-ubehandlet.svg';
import ikonFerdig from '../../resources/images/ikon-steg-ferdig.svg';
import ikonVarsel from '../../resources/images/ikon-steg-varsel.svg';

class Vilkarsvurdering extends Component {
  // Todo 1: Ikoner klippes i portview i svg etter import.
  // Todo 2: Sett opp evt. prop types og hook opp mot Redux med dispatch.

  static propTypes = {};
  static defaultProps = {};

  state = {
    stepIndex: null,
    visited: [],
  };

  componentWillMount() {
    const { stepIndex, visited } = this.state;
    this.setState({ visited: visited.concat(stepIndex) });
  }

  render() {
    const valg = {
      visNesteKnapp: true,
      ikoner: {
        ikonUbehandlet,
        ikonFerdig,
        ikonVarsel,
      },
    };

    return (
      <div className="vilkarsvurdering">
        <StegVelger valg={valg}>
          <StegFane>
            <Innholdstittel type="innholdstittel">Vurdering:</Innholdstittel>
            <Fieldset legend="Vurder om søkeren er:">
              <Radio id="steg0_ikke_arbeidende" name="arbeidssted" label="Ikke arbeidende / yrkesmottaker" />
              <Radio id="steg0_arbeidstaker" name="arbeidssted" label="Arbeidstaker" />
              <Radio id="steg0_selvstendig" name="arbeidssted"label="Selvstendig næringsdrivende" />
              <Radio id="steg0_arbeidstaker_selvstendig" name="arbeidssted" label="Både arbeidstakende og selvstendig" />
            </Fieldset>
          </StegFane>
          <StegFane>
            <Innholdstittel type="innholdstittel">Vurdering:</Innholdstittel>
            <Fieldset legend="Gjelder én eller flere av dissefor søkeren?">
              <Checkbox id="steg1_ansatt_offentlig" label="Offentlig tjenestepensjon (relevant for 11.3 b)" />
              <Checkbox id="steg1_ansatt_skip" label="Ansatt på skip (relevant for 11.4" />
              <Checkbox id="steg1_ansatt_sokkel" label="Ansatt på sokkel (relevant for 11.3 a)" />
              <Checkbox id="steg1_ansatt_flyvende" label="Flyvende personell (relevant for 11.5)" />
            </Fieldset>
          </StegFane>
          <StegFane>
            <Innholdstittel type="innholdstittel">Vurdering:</Innholdstittel>
            <Fieldset legend="Hvor mange land skal søker arbeide/drive virsomhet i?">
              <Radio id="steg2_land_ett" name="land" label="Ett" />
              <Radio id="steg2_land_flere" name="land" label="To eller flere" />
            </Fieldset>
            <Fieldset legend="Hvor mye av aktiviteten skjed i Norge?">
              <Radio id="steg2_aktivitet_under25" name="aktivitet" label="Mindre enn 25%" />
              <Radio id="steg2_aktivitet_over25" name="aktivitet" label="25% eller mer" />
            </Fieldset>
            <Fieldset legend="Hvor mange arbeidsgivere har søker?">
              <Radio id="steg2_arbeidsgivere_en" name="arbeidsgivere" label="Èn" />
              <Radio id="steg2_arbeidsgivere_fler" name="arbeidsgivere" label="To eller fler" />
            </Fieldset>
            <Fieldset legend="Er arbeidsgivere i sammme land eller i ulike land?">
              <Radio id="steg2_arbeidsgiverfordeling_ettland" name="arbeidsgiverfordeling" label="Samme land" />
              <Radio id="steg2_arbeidsgiverfordeling_ulikeland" name="arbeidsgiverfordeling" label="Ulike land" />
            </Fieldset>
          </StegFane>
          <StegFane>
            <Innholdstittel type="innholdstittel">Foreslått vedtak:</Innholdstittel>

          </StegFane>
        </StegVelger>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Vilkarsvurdering);
