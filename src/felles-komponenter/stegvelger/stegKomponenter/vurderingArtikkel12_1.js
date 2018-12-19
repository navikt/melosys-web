import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import * as MPT from './../../../proptypes';
import * as Koder from '../../../koder';

import { kodeverkObjektTilTerm } from '../../../utils/kodeverk';

class VurderingArtikkel12_1 extends Component {
  /* Bakgrunn: Hvert vilkår er uttrykt som en two-state, dvs true eller false i domenemodellen. Problemet
   * med de 3 radiovalgene i grensesnittet er at disse ville representert en tri-state ("ja", "nei, men..." og "nei").
   * Siden Redux Form ikke støtter at man setter flere verdier til forskjellige felter må vi bruke
   * ikke-knyttede NAV-komponenter og håndtere Redux Form-oppdateringen manuelt via funksjonen 'settSkjemaVerdi'
   * som vi får fra stegvelger-parenten.
   *
   * Dette er årsaken til at denne komponenten avviker fra de andre og ikke benytter NAV-Skjema-komponentene direkte.
   */
  constructor() {
    super();
    this.ART12_1 = Koder.FO_883_2004_ART12_1;
    this.ART16_1 = Koder.FO_883_2004_ART16_1;
    this.AVSLAG = 'AVSLAG';
  }

  state = { valgtVilkar: '' };

  componentDidMount() {
    this.lagreValgtVilkarState({});
  }

  componentDidUpdate(prevProps) {
    this.lagreValgtVilkarState(prevProps);
  }

  componentWillUnmount() {
    const { settSkjemaVerdi } = this.props;
    settSkjemaVerdi('vilkar.art12_1', null);
    settSkjemaVerdi('vilkar.art16_1', null);
  }

  settStateForVilkar = vilkar => this.setState({ valgtVilkar: vilkar });

  lagreValgtVilkarState = ({ tilstand = {} }) => {
    const { art12_1: old_art12_1, art16_1: old_art16_1 } = tilstand;
    const { art12_1, art16_1 } = this.props.tilstand;

    if ((art12_1 === old_art12_1) && (art16_1 === old_art16_1)) { return; }

    if (art12_1) (this.settStateForVilkar(this.ART12_1));
    if (art16_1 && art12_1 === false) (this.settStateForVilkar(this.ART16_1));
    if (art16_1 === false && art12_1 === false) (this.settStateForVilkar(this.AVSLAG));
  };

  radioEndringHandler = event => {
    const { value } = event.target;
    const { settSkjemaVerdi } = this.props;

    if (value === this.ART12_1) {
      settSkjemaVerdi('vilkar.art12_1', true);
      settSkjemaVerdi('vilkar.art16_1', null);
    } else if (value === this.ART16_1) {
      settSkjemaVerdi('vilkar.art16_1', true);
      settSkjemaVerdi('vilkar.art12_1', false);
    } else {
      settSkjemaVerdi('vilkar.art12_1', false);
      settSkjemaVerdi('vilkar.art16_1', false);
    }
  };

  render () {
    const {
      bekreftOgFortsett, begrunnelser, artikkel, tilstand,
    } = this.props;

    const { valgtVilkar } = this.state;
    const { visBegrunnelser, harAvklaring } = tilstand;

    return (
      <div>
        <Nav.Undertittel>Vurdering av artikkel 12.1</Nav.Undertittel>
        <div>
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Fieldset legend="Fyller søker resterende kriterier for artikkel 12.1?">
                <Nav.Radio
                  name="artikkel12"
                  onChange={this.radioEndringHandler}
                  value={this.ART12_1}
                  checked={valgtVilkar === this.ART12_1}
                  label="Ja"
                />
                <Nav.Radio
                  name="artikkel12"
                  onChange={this.radioEndringHandler}
                  value={this.ART16_1}
                  checked={valgtVilkar === this.ART16_1}
                  label="Nei, jeg vil vurdere artikkel 16.1"
                />
                <Nav.Radio
                  name="artikkel12"
                  onChange={this.radioEndringHandler}
                  value={this.AVSLAG}
                  checked={valgtVilkar === this.AVSLAG}
                  label={`Nei, jeg vil avslå søknaden etter artikkel ${kodeverkObjektTilTerm(artikkel)} og 16.1`}
                />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
          { visBegrunnelser && (
            <Nav.Row>
              <Nav.Column xs="12" md="10" lg="8">
                <Nav.Fieldset legend="Begrunnelse:">
                  <Skjema.ListeVelger
                    feltNavn="vilkar.art12_1_begrunnelser"
                    muligeValg={begrunnelser}
                    label="Legg til begrunnelse:"
                    gruppe
                    tillatFritekst={false}
                  />
                </Nav.Fieldset>
              </Nav.Column>
            </Nav.Row>
          )}
        </div>
        <div className="fane__knapplinje">
          <Nav.Knapp disabled={!harAvklaring} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </div>
    );
  }
}

VurderingArtikkel12_1.propTypes = {
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  artikkel: MPT.Kodeverk,
  settSkjemaVerdi: PT.func.isRequired,
};

VurderingArtikkel12_1.defaultProps = {
  tilstand: {},
  artikkel: {},
};

export default VurderingArtikkel12_1;
