import React, { Component } from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from './../../../proptypes';

import * as KV from '../../../kodeverk';
import { arrayTilKonjunksjon } from '../../../utils/streng';

import './vurderingArtikkel11_4.css';
import * as Skjema from '../../skjema';
import { BOOLSK } from '../../../constants';

class VurderingArtikkel11_4 extends Component {
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
    this.ART11_4_1 = MKV.Koder.lovvalgsbestemmelser.tillegg.FO_883_2004_ART11_4_1;
    this.ART11_4_2 = MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART11_4_2;
    this.TIL_VURDERING_12_1 = 'TIL_VURDERING_12_1';
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
    settSkjemaVerdi('vilkar.art11_4_1', null);
    settSkjemaVerdi('vilkar.art11_4_2', null);
    settSkjemaVerdi('vilkar.art11_3A', null);
    settSkjemaVerdi('vilkar.nis', null);
  }

  settStateForVilkar = vilkar => this.setState({ valgtVilkar: vilkar });

  lagreValgtVilkarState = ({ tilstand = {} }) => {
    const { art11_3A: old_art11_3A, art11_4_1: old_art11_4_1, art11_4_2: old_art11_4_2 } = tilstand;
    const { art11_3A, art11_4_1, art11_4_2 } = this.props.tilstand;

    if ((art11_4_1 === old_art11_4_1) && (art11_4_2 === old_art11_4_2) && (art11_3A === old_art11_3A)) { return false; }

    if (art11_4_1 && art11_3A) (this.settStateForVilkar(this.ART11_4_1));
    if (art11_4_2) (this.settStateForVilkar(this.ART11_4_2));
    if (art11_4_1 && !art11_3A) (this.settStateForVilkar(this.TIL_VURDERING_12_1));
    return true;
  };

  radioEndringHandler = event => {
    const { value } = event.target;
    const { settSkjemaVerdi } = this.props;

    if (value === this.ART11_4_1) {
      settSkjemaVerdi('vilkar.art11_4_1', true);
      settSkjemaVerdi('vilkar.art11_3A', true);
      settSkjemaVerdi('vilkar.art11_4_2', null);
    } else if (value === this.ART11_4_2) {
      settSkjemaVerdi('vilkar.art11_3A', null);
      settSkjemaVerdi('vilkar.art11_4_1', null);
      settSkjemaVerdi('vilkar.art11_4_2', true);
      settSkjemaVerdi('vilkar.nis', null);
    } else {
      settSkjemaVerdi('vilkar.art11_3A', null);
      settSkjemaVerdi('vilkar.art11_4_1', true);
      settSkjemaVerdi('vilkar.art11_4_2', null);
      settSkjemaVerdi('vilkar.nis', null);
    }
  };

  render () {
    const {
      bekreftOgFortsett, tilstand, bostedsland, oppholdsland, valgteArbeidsgivere, redigerbart,
    } = this.props;

    const { valgtVilkar } = this.state;
    const { harAvklaring, visNISAvsnitt } = tilstand;

    const oppholdsLandSetning = arrayTilKonjunksjon(oppholdsland.map(land => KV.objektTilTerm(land)));

    const virksomhetLandListe = valgteArbeidsgivere
      .reduce((samling, arbeidsgiver) => {
        const land = (arbeidsgiver.forretningsadresse ? arbeidsgiver.forretningsadresse.land : null);
        const landMedstorForbokstav = land.charAt(0).toUpperCase() + land.slice(1).toLowerCase();

        return land ? [...samling, landMedstorForbokstav] : [...samling];
      }, []);
    const virksomhetsLandSetning = arrayTilKonjunksjon(virksomhetLandListe);

    return (
      <div className="vurderingArtikkel11_4">
        <Nav.Undertittel>Vurdering av artikkel 11.4</Nav.Undertittel>
        <div>
          <Nav.Row>
            <Nav.Column xs="12">
              <dl className="vurdering__land">
                <dt>Arbeidsland / flaggland er:</dt>
                <dd>{oppholdsLandSetning}</dd>
                <dt>Arbeidsgiver / selvstendig næringsdrivende har virksomhet i:</dt>
                <dd>{virksomhetsLandSetning}</dd>
                <dt>Søker er bosatt i:</dt>
                <dd>{KV.objektTilTerm(bostedsland)}</dd>
              </dl>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Fieldset legend="Fyller søker resterende kriterier for artikkel 11.4?">
                <Nav.Radio
                  name="artikkel11"
                  onChange={this.radioEndringHandler}
                  value={this.ART11_4_1}
                  checked={valgtVilkar === this.ART11_4_1}
                  label="11.4 i - Norge er flagglandet"
                  disabled={!redigerbart}
                />
                <Nav.Radio
                  name="artikkel11"
                  onChange={this.radioEndringHandler}
                  value={this.ART11_4_2}
                  checked={valgtVilkar === this.ART11_4_2}
                  label="11.4 ii - arbeidsgiver i bostedslandet"
                  disabled={!redigerbart}
                />
                <Nav.Radio
                  name="artikkel11"
                  onChange={this.radioEndringHandler}
                  value={this.TIL_VURDERING_12_1}
                  checked={valgtVilkar === this.TIL_VURDERING_12_1}
                  label="11.4 i - flagglandet, men jeg vil vurdere Artikkel 12.1"
                  disabled={!redigerbart}
                />
              </Nav.Fieldset>
              { visNISAvsnitt && (
                <Nav.Fieldset legend="Jobber søker i hotell- eller restaurantnæring på NIS-registrert skip?">
                  <Skjema.Radio disabled={!redigerbart} feltNavn="vilkar.nis" value={BOOLSK.SANN} label="Ja" />
                  <Skjema.Radio disabled={!redigerbart} feltNavn="vilkar.nis" value={BOOLSK.USANN} label="Nei" />
                </Nav.Fieldset>
              )
              }
            </Nav.Column>
          </Nav.Row>
        </div>
        <div className="fane__knapplinje">
          <Nav.Knapp disabled={!(redigerbart && harAvklaring)} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </div>
    );
  }
}

VurderingArtikkel11_4.propTypes = {
  bostedsland: MPT.Kodeverk,
  oppholdsland: PT.arrayOf(MPT.Kodeverk),
  valgteArbeidsgivere: PT.arrayOf(MPT.Kodeverk),
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  artikkel: MPT.Kodeverk,
  settSkjemaVerdi: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

VurderingArtikkel11_4.defaultProps = {
  tilstand: {},
  artikkel: {},
  bostedsland: {},
  oppholdsland: [],
  valgteArbeidsgivere: {},
};

export default VurderingArtikkel11_4;
