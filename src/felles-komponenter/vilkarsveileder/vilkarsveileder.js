import React, { Component } from 'react';
import { connect } from 'react-redux';

import * as Nav from '../../utils/navFrontend';
import * as Ikon from '../../resources/images';
import StegVelger from './komponenter/stegVelger';
import StegFane from './komponenter/stegFane';

import './vilkarsveileder.css';

class Vilkarsveileder extends Component {
  static propTypes = {};
  static defaultProps = {};

  static status = {
    UBEHANDLET: 'UBEHANDLET',
    AKTIV: 'AKTIV',
    BEHANDLET: 'BEHANDLET',
    ADVARSEL: 'ADVARSEL',
    FEIL: 'FEIL',
  };

  static stegIkoner = {
    UBEHANDLET: Ikon.Ubehandlet,
    AKTIV: Ikon.Aktivt,
    BEHANDLET: Ikon.Ferdig,
    ADVARSEL: Ikon.Varsel,
    FEIL: Ikon.Feil,
  };

  static vedtakIkoner = {
    UBEHANDLET: Ikon.VedakUbehandlet,
    AKTIV: Ikon.VedtakGodkjent,
    BEHANDLET: Ikon.VedtakGodkjent,
    ADVARSEL: Ikon.VedtakAvslatt,
    FEIL: Ikon.VedtakAvslatt,
  };

  componentWillMount() {
    this.setState({
      aktivtSteg: 0,
      steg: [
        { status: Vilkarsveileder.status.AKTIV, id: 0, ikoner: Vilkarsveileder.stegIkoner, tilgjengelig: true },
        { status: Vilkarsveileder.status.UBEHANDLET, id: 1, ikoner: Vilkarsveileder.stegIkoner, tilgjengelig: true },
        { status: Vilkarsveileder.status.UBEHANDLET, id: 2, ikoner: Vilkarsveileder.stegIkoner, tilgjengelig: true },
        { status: Vilkarsveileder.status.UBEHANDLET, id: 3, ikoner: Vilkarsveileder.stegIkoner, tilgjengelig: true },
        { status: Vilkarsveileder.status.UBEHANDLET, id: 4, ikoner: Vilkarsveileder.stegIkoner, tilgjengelig: true },
        { status: Vilkarsveileder.status.UBEHANDLET, id: 5, ikoner: Vilkarsveileder.vedtakIkoner, tilgjengelig: true },
      ] });
  }

  handleSubmit = () => {

  }

  /** Her vil validering på hver enkelt felt / fane kunne åpne
   * opp for nye tilgjengelige faner etter at saksbehandler
   * har bekreftet valgene.
   */
  bekreftOgFortsett = () => {
    this.nestSteg();
  }

  /** Gå til et konkret steg i steglisten, angitt av en indeks
   * som begynnner med 0.
   * @param nyttSteg Number Steget som det skal byttes til.
   */
  tilSteg = nyttStegNummer => {
    const nyStegIkonState = { ...this.state.steg[nyttStegNummer] };
    const gammelStegIkonState = { ...this.state.steg[this.state.aktivtSteg] };
    nyStegIkonState.status = Vilkarsveileder.status.AKTIV;
    gammelStegIkonState.status = Vilkarsveileder.status.BEHANDLET;

    const nyeSteg = [...this.state.steg];
    nyeSteg[this.state.aktivtSteg] = gammelStegIkonState;
    nyeSteg[nyttStegNummer] = nyStegIkonState;

    this.setState({ steg: nyeSteg });
    this.setState({ aktivtSteg: nyttStegNummer });
  }

  /** Gå til neste steg i rekken, men ikke lenger enn
   * maks antall steg. Ved forsøk på å gå ytterligere steg
   * enn hva som er mulig skal funksjonen defaulte til siste steg.
   */
  nestSteg = () => {
    const maksSteg = this.state.steg.length;
    const nyttSteg = (this.state.aktivtSteg + 1 < maksSteg) ? this.state.aktivtSteg + 1 : this.state.aktivtSteg;
    this.tilSteg(nyttSteg);
  }

  render() {
    return (
      <div className="vilkarsveileder panelSeksjon">
        <StegVelger steg={this.state.steg} stegKlikk={this.tilSteg} />
        <StegFane stegNummer={0} aktivtSteg={this.state.aktivtSteg}>
          <Nav.Undertittel>Opprette sak:</Nav.Undertittel>
          <Nav.Normaltekst>Velg type søknad og legg inn periode</Nav.Normaltekst>
          <Nav.Row>
            <Nav.Fieldset legend="">
              <Nav.Column xs="4">
                <Nav.Select label="Type søknad" bredde="s">
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="annen">Annen</option>
                </Nav.Select>
              </Nav.Column>
              <Nav.Column xs="4">
                <Nav.Input label="Fra dato" bredde="s" />
              </Nav.Column>
              <Nav.Column xs="4">
                <Nav.Input label="Til dato" bredde="s" />
              </Nav.Column>
            </Nav.Fieldset>
            <div className="fane__knapplinje">
              <Nav.Knapp className="fane__navigasjonsknapp" onClick={() => {}}>Avbryt</Nav.Knapp>
              <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={() => this.bekreftOgFortsett()}>Bekreft og fortsett</Nav.Knapp>
            </div>
          </Nav.Row>
        </StegFane>
        <StegFane stegNummer={1} aktivtSteg={this.state.aktivtSteg}>
          <Nav.Undertittel>Saken er opprettet:</Nav.Undertittel>
          <Nav.Normaltekst>Saken er nå opprettet. Det er manglelfulle opplysninger i søknaden. Du kan velge å fylle dem ut nå, eller utsette det til saken skal behandles.</Nav.Normaltekst>
          <div className="fane__knapplinje">
            <Nav.Knapp className="fane__navigasjonsknapp" onClick={() => {}}>Sett i kø</Nav.Knapp>
            <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={() => this.bekreftOgFortsett()}>Start behandling</Nav.Knapp>
          </div>
        </StegFane>
        <StegFane stegNummer={2} aktivtSteg={this.state.aktivtSteg}>
          <Nav.Undertittel>Vurdering:</Nav.Undertittel>
          <Nav.Fieldset legend="Vurder om søkeren er:">
            <Nav.Radio id="steg0_ikke_arbeidende" name="arbeidssted" label="Ikke arbeidende / ytelsesmottaker" />
            <Nav.Radio id="steg0_arbeidstaker" name="arbeidssted" label="Arbeidstaker" />
            <Nav.Radio id="steg0_selvstendig" name="arbeidssted" label="Selvstendig næringsdrivende" />
            <Nav.Radio id="steg0_arbeidstaker_selvstendig" name="arbeidssted" label="Både arbeidstakende og selvstendig" />
          </Nav.Fieldset>
          <div className="fane__knapplinje">
            <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={() => this.bekreftOgFortsett()}>Bekreft og fortsett</Nav.Knapp>
          </div>
        </StegFane>
        <StegFane stegNummer={3} aktivtSteg={this.state.aktivtSteg}>
          <Nav.Undertittel>Vurdering:</Nav.Undertittel>
          <Nav.Fieldset legend="Gjelder én eller flere av disse for søkeren?">
            <Nav.Checkbox id="steg1_ansatt_offentlig" label="Offentlig tjenesteperson (relevant for 11.3 b)" />
            <Nav.Checkbox id="steg1_ansatt_skip" label="Ansatt på skip (relevant for 11.4" />
            <Nav.Checkbox id="steg1_ansatt_sokkel" label="Ansatt på sokkel (relevant for 11.3 a)" />
            <Nav.Checkbox id="steg1_ansatt_flyvende" label="Flyvende personell (relevant for 11.5)" />
          </Nav.Fieldset>
          <div className="fane__knapplinje">
            <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={() => this.bekreftOgFortsett()}>Bekreft og fortsett</Nav.Knapp>
          </div>
        </StegFane>
        <StegFane stegNummer={4} aktivtSteg={this.state.aktivtSteg}>
          <Nav.Undertittel>Vurdering:</Nav.Undertittel>
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
          <Nav.Fieldset legend="Er arbeidsgivere i samme land eller i ulike land?">
            <Nav.Radio id="steg2_arbeidsgiverfordeling_ettland" name="arbeidsgiverfordeling" label="Samme land" />
            <Nav.Radio id="steg2_arbeidsgiverfordeling_ulikeland" name="arbeidsgiverfordeling" label="Ulike land" />
          </Nav.Fieldset>
          <div className="fane__knapplinje">
            <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={() => this.bekreftOgFortsett()}>Bekreft og fortsett</Nav.Knapp>
          </div>
        </StegFane>
        <StegFane stegNummer={5} aktivtSteg={this.state.aktivtSteg}>
          <Nav.Container fluid>
            <Nav.Row>
              <Nav.Column xs="12">
                <Nav.Undertittel>Foreslått vedtak:</Nav.Undertittel>
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
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Vilkarsveileder);
