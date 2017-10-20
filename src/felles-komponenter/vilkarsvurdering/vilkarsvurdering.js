import React, { Component } from 'react';
import { connect } from 'react-redux';

import * as Nav from '../../utils/navFrontend';
import StegVelger from './komponenter/stegVelger';
import StegFane from './komponenter/stegFane';
import './vilkarsvurdering.css';
import * as Ikon from '../../resources/images';

class Vilkarsvurdering extends Component {
  // Todo: Sett opp evt. prop types og hook opp mot Redux med dispatch.
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      stepIndex: null,
      visited: [],
    };
  }

  componentWillMount() {
    const { stepIndex, visited } = this.state;
    this.setState({ visited: visited.concat(stepIndex) });
  }

  render() {
    const stegIkoner = {
      UBEHANDLET: Ikon.Ubehandlet,
      AKTIVT: Ikon.Aktivt,
      BEHANDLET: Ikon.Ferdig,
      ADVARSEL: Ikon.Varsel,
      FEIL: Ikon.Feil,
    };

    const vedtakIkoner = {
      UBEHANDLET: Ikon.VedakUbehandlet,
      AKTIVT: Ikon.VedtakGodkjent,
      BEHANDLET: Ikon.VedtakGodkjent,
      ADVARSEL: Ikon.VedtakAvslatt,
      FEIL: Ikon.VedtakAvslatt,
    };

    return (
      <div className="vilkarsvurdering panelSeksjon">
        <StegVelger>
          <StegFane ikoner={stegIkoner} visNesteKnapp>
            <Nav.Innholdstittel type="innholdstittel">Vurdering:</Nav.Innholdstittel>
            <Nav.Fieldset legend="Vurder om søkeren er:">
              <Nav.Radio id="steg0_ikke_arbeidende" name="arbeidssted" label="Ikke arbeidende / yrkesmottaker" />
              <Nav.Radio id="steg0_arbeidstaker" name="arbeidssted" label="Arbeidstaker" />
              <Nav.Radio id="steg0_selvstendig" name="arbeidssted"label="Selvstendig næringsdrivende" />
              <Nav.Radio id="steg0_arbeidstaker_selvstendig" name="arbeidssted" label="Både arbeidstakende og selvstendig" />
            </Nav.Fieldset>
          </StegFane>
          <StegFane ikoner={stegIkoner} visNesteKnapp>
            <Nav.Innholdstittel type="innholdstittel">Vurdering:</Nav.Innholdstittel>
            <Nav.Fieldset legend="Gjelder én eller flere av disse for søkeren?">
              <Nav.Checkbox id="steg1_ansatt_offentlig" label="Offentlig tjenestepensjon (relevant for 11.3 b)" />
              <Nav.Checkbox id="steg1_ansatt_skip" label="Ansatt på skip (relevant for 11.4" />
              <Nav.Checkbox id="steg1_ansatt_sokkel" label="Ansatt på sokkel (relevant for 11.3 a)" />
              <Nav.Checkbox id="steg1_ansatt_flyvende" label="Flyvende personell (relevant for 11.5)" />
            </Nav.Fieldset>
          </StegFane>
          <StegFane ikoner={stegIkoner} visNesteKnapp>
            <Nav.Innholdstittel type="innholdstittel">Vurdering:</Nav.Innholdstittel>
            <Nav.Fieldset legend="Hvor mange land skal søker arbeide/drive virsomhet i?">
              <Nav.Radio id="steg2_land_ett" name="land" label="Ett" />
              <Nav.Radio id="steg2_land_flere" name="land" label="To eller flere" />
            </Nav.Fieldset>
            <Nav.Fieldset legend="Hvor mye av aktiviteten skjed i Norge?">
              <Nav.Radio id="steg2_aktivitet_under25" name="aktivitet" label="Mindre enn 25%" />
              <Nav.Radio id="steg2_aktivitet_over25" name="aktivitet" label="25% eller mer" />
            </Nav.Fieldset>
            <Nav.Fieldset legend="Hvor mange arbeidsgivere har søker?">
              <Nav.Radio id="steg2_arbeidsgivere_en" name="arbeidsgivere" label="Èn" />
              <Nav.Radio id="steg2_arbeidsgivere_fler" name="arbeidsgivere" label="To eller fler" />
            </Nav.Fieldset>
            <Nav.Fieldset legend="Er arbeidsgivere i sammme land eller i ulike land?">
              <Nav.Radio id="steg2_arbeidsgiverfordeling_ettland" name="arbeidsgiverfordeling" label="Samme land" />
              <Nav.Radio id="steg2_arbeidsgiverfordeling_ulikeland" name="arbeidsgiverfordeling" label="Ulike land" />
            </Nav.Fieldset>
          </StegFane>
          <StegFane ikoner={vedtakIkoner}>
            <Nav.Container fluid>
              <Nav.Row>
                <Nav.Column xs="12">
                  <Nav.Systemtittel type="systemtittel">Foreslått vedtak:</Nav.Systemtittel>
                </Nav.Column>
              </Nav.Row>
              <Nav.Row>
                <Nav.Column xs="12">
                  <Nav.Normaltekst type="normaltekst">Resultat:</Nav.Normaltekst>
                  <Nav.UndertekstBold>Medlemsskap i norsk folketrygd er innvilget, etter artikkel 12.1</Nav.UndertekstBold>
                </Nav.Column>
              </Nav.Row>
              <Nav.Row>
                <Nav.Column xs="6" md="3">
                  <Nav.Element type="element">Antall måneder i utlandet</Nav.Element>
                  <Nav.Normaltekst>11</Nav.Normaltekst>
                </Nav.Column>
                <Nav.Column xs="6" md="3">
                  <Nav.Element type="element">Land</Nav.Element>
                  <Nav.Normaltekst>Tyskland og Sverige</Nav.Normaltekst>
                </Nav.Column>
                <Nav.Column xs="6" md="3">
                  <Nav.Element type="element">Søker er</Nav.Element>
                  <Nav.Normaltekst>Arbeidstaker</Nav.Normaltekst>
                </Nav.Column>
                <Nav.Column xs="6" md="3">
                  <Nav.Element type="element">Navn på arbeidsgiver</Nav.Element>
                  <Nav.Normaltekst>Hagemøbler Import AS</Nav.Normaltekst>
                </Nav.Column>
              </Nav.Row>
              <Nav.Row>
                <Nav.Column xs="6" className="fane__fot">
                  <Nav.Knapp type="hoved">Fatt vedtak</Nav.Knapp>
                </Nav.Column>
                <Nav.Column xs="6" className="fane__fot">
                  <a href="http://localhost">Forhåndsvis vedtaksbrev</a>
                </Nav.Column>
              </Nav.Row>
            </Nav.Container>
          </StegFane>
        </StegVelger>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Vilkarsvurdering);
