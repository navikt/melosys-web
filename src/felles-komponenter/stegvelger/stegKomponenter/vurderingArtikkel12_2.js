import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import * as MPT from './../../../proptypes';
import { vilkar as vilkarKoder } from '../../../kodeverk/koder';

import { kodeverkObjektTilTerm } from '../../../utils/kodeverk';

class VurderingArtikkel12_2 extends Component {
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
    settSkjemaVerdi('vilkar.art12_2', null);
    settSkjemaVerdi('vilkar.art16_2', null);
  }

  settStateForVilkar = vilkar => {
    this.setState({ valgtVilkar: vilkar });
  };

  lagreValgtVilkarState = ({ tilstand = {} }) => {
    const { art12_2: old_art12_2, art16_1: old_art16_1 } = tilstand;
    const { art12_2, art16_1 } = this.props.tilstand;

    if ((art12_2 === old_art12_2) && (art16_1 === old_art16_1)) { return; }

    if (art12_2) (this.settStateForVilkar(vilkarKoder.FO_883_2004_ART12_2));
    if (art16_1 && art12_2 === false) (this.settStateForVilkar(vilkarKoder.FO_883_2004_ART16_1));
    if (art16_1 === false && art12_2 === false) (this.settStateForVilkar(this.AVSLAG));
  };

  radioEndringHandler = event => {
    const { value } = event.target;
    const { settSkjemaVerdi } = this.props;

    if (value === vilkarKoder.FO_883_2004_ART12_2) {
      settSkjemaVerdi('vilkar.art12_2', true);
      settSkjemaVerdi('vilkar.art16_1', null);
    } else if (value === vilkarKoder.FO_883_2004_ART16_1) {
      settSkjemaVerdi('vilkar.art12_2', false);
      settSkjemaVerdi('vilkar.art16_1', true);
    } else {
      settSkjemaVerdi('vilkar.art12_2', false);
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
        <Nav.Undertittel>Vurdering av artikkel 12. 2</Nav.Undertittel>
        <div>
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Fieldset legend="Fyller søker resterende kriterier for artikkel 12.2?">
                <Nav.Radio
                  name="artikkel"
                  onChange={this.radioEndringHandler}
                  value={vilkarKoder.FO_883_2004_ART12_2}
                  checked={valgtVilkar === vilkarKoder.FO_883_2004_ART12_2}
                  label="Ja"
                />
                <Nav.Radio
                  name="artikkel"
                  onChange={this.radioEndringHandler}
                  value={vilkarKoder.FO_883_2004_ART16_1}
                  checked={valgtVilkar === vilkarKoder.FO_883_2004_ART16_1}
                  label="Nei, jeg vil vurdere artikkel 16.1"
                />
                <Nav.Radio
                  name="artikkel"
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
                    feltNavn="vilkar.art12_2_begrunnelser"
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

VurderingArtikkel12_2.propTypes = {
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  artikkel: MPT.Kodeverk,
  settSkjemaVerdi: PT.func.isRequired,
};

VurderingArtikkel12_2.defaultProps = {
  tilstand: {},
  artikkel: {},
};

export default VurderingArtikkel12_2;
