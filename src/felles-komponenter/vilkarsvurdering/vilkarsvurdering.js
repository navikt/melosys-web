import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Checkbox, Radio, Fieldset } from 'nav-frontend-skjema';
import { Innholdstittel, Systemtittel, Element, Normaltekst, UndertekstBold } from 'nav-frontend-typografi';
import { Knapp } from 'nav-frontend-knapper';
import { Container, Row, Column } from 'nav-frontend-grid';
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
      <div className="vilkarsvurdering">
        <StegVelger>
          <StegFane ikoner={stegIkoner} visNesteKnapp>
            <Innholdstittel type="innholdstittel">Vurdering:</Innholdstittel>
            <Fieldset legend="Vurder om søkeren er:">
              <Radio id="steg0_ikke_arbeidende" name="arbeidssted" label="Ikke arbeidende / yrkesmottaker" />
              <Radio id="steg0_arbeidstaker" name="arbeidssted" label="Arbeidstaker" />
              <Radio id="steg0_selvstendig" name="arbeidssted"label="Selvstendig næringsdrivende" />
              <Radio id="steg0_arbeidstaker_selvstendig" name="arbeidssted" label="Både arbeidstakende og selvstendig" />
            </Fieldset>
          </StegFane>
          <StegFane ikoner={stegIkoner} visNesteKnapp>
            <Innholdstittel type="innholdstittel">Vurdering:</Innholdstittel>
            <Fieldset legend="Gjelder én eller flere av disse for søkeren?">
              <Checkbox id="steg1_ansatt_offentlig" label="Offentlig tjenestepensjon (relevant for 11.3 b)" />
              <Checkbox id="steg1_ansatt_skip" label="Ansatt på skip (relevant for 11.4" />
              <Checkbox id="steg1_ansatt_sokkel" label="Ansatt på sokkel (relevant for 11.3 a)" />
              <Checkbox id="steg1_ansatt_flyvende" label="Flyvende personell (relevant for 11.5)" />
            </Fieldset>
          </StegFane>
          <StegFane ikoner={stegIkoner} visNesteKnapp>
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
          <StegFane ikoner={vedtakIkoner}>
            <Container fluid>
              <Row>
                <Column xs="12">
                  <Systemtittel type="systemtittel">Foreslått vedtak:</Systemtittel>
                </Column>
              </Row>
              <Row>
                <Column xs="12">
                  <Normaltekst type="normaltekst">Resultat:</Normaltekst>
                  <UndertekstBold>Medlemsskap i norsk folketrygd er innvilget, etter artikkel 12.1</UndertekstBold>
                </Column>
              </Row>
              <Row>
                <Column xs="6" md="3">
                  <Element type="element">Antall måneder i utlandet</Element>
                  <Normaltekst>11</Normaltekst>
                </Column>
                <Column xs="6" md="3">
                  <Element type="element">Land</Element>
                  <Normaltekst>Tyskland og Sverige</Normaltekst>
                </Column>
                <Column xs="6" md="3">
                  <Element type="element">Søker er</Element>
                  <Normaltekst>Arbeidstaker</Normaltekst>
                </Column>
                <Column xs="6" md="3">
                  <Element type="element">Navn på arbeidsgiver</Element>
                  <Normaltekst>Hagemøbler Import AS</Normaltekst>
                </Column>
              </Row>
              <Row>
                <Column xs="6" className="fane__fot">
                  <Knapp type="hoved">Fatt vedtak</Knapp>
                </Column>
                <Column xs="6" className="fane__fot">
                  <a href="http://localhost">Forhåndsvis vedtaksbrev</a>
                </Column>
              </Row>
            </Container>
          </StegFane>
        </StegVelger>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Vilkarsvurdering);
