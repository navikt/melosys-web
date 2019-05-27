import React, { Component } from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from './../../../proptypes';

import * as KV from '../../../kodeverk';
import { arrayTilKonjunksjon } from '../../../utils/streng';

import './vurderingArtikkel11_4.css';
import { BOOLSK } from '../../../constants';
import { konverterTilStegData, lagVilkaar, slettVilkar } from '../../../regler/vilkar';

class VurderingArtikkel11_4 extends Component {
  /* Bakgrunn: Hvert vilkår er uttrykt som en two-state, dvs true eller false i domenemodellen. Problemet
   * med de 3 radiovalgene i grensesnittet er at disse ville representert en tri-state ("ja", "nei, men..." og "nei").
   * Dette er årsaken til at denne komponenten avviker fra de andre og ikke benytter NAV-Skjema-komponentene direkte.
   */
  constructor() {
    super();
    this.ART11_4_1 = MKV.Koder.lovvalgsbestemmelser.tillegg.FO_883_2004_ART11_4_1;
    this.ART11_4_2 = MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART11_4_2;
    this.TIL_VURDERING_12_1 = 'TIL_VURDERING_12_1';
  }

  componentDidMount() {
    const { oppdaterData, tilstand } = this.props;
    const {
      art11_4_1, art11_4_2, art11_3A, nis,
    } = tilstand;
    oppdaterData(konverterTilStegData('art11_4_1', art11_4_1));
    oppdaterData(konverterTilStegData('art11_4_2', art11_4_2));
    oppdaterData(konverterTilStegData('art11_3A', art11_3A));
    oppdaterData(konverterTilStegData('nis', nis));
  }

  componentWillUnmount() {
    this.props.slettData();
  }

  nisEndret = event => {
    const { oppdaterData } = this.props;
    oppdaterData(lagVilkaar('nis', event.target.value));
  };

  radioEndringHandler = event => {
    const { value } = event.target;
    const { slettData, oppdaterData } = this.props;

    if (value === this.ART11_4_1) {
      oppdaterData(lagVilkaar('art11_4_1', true));
      oppdaterData(lagVilkaar('art11_3A', true));
      slettData(slettVilkar('art11_4_2'));
    } else if (value === this.ART11_4_2) {
      slettData(slettVilkar('art11_3A'));
      slettData(slettVilkar('art11_4_1'));
      oppdaterData(lagVilkaar('art11_4_2', true));
      slettData(slettVilkar('nis'));
    } else {
      slettData(slettVilkar('art11_3A'));
      oppdaterData(lagVilkaar('art11_4_1', true));
      slettData(slettVilkar('art11_4_2'));
      slettData(slettVilkar('nis'));
    }
  };

  render () {
    const {
      bekreftOgFortsett, tilstand, bostedsland, arbeidsland, valgteVirksomheter, redigerbart,
    } = this.props;

    const {
      harAvklaring, visNISAvsnitt, art11_4_1, art11_4_2, art11_3A, nis,
    } = tilstand;

    const arbeidsLandSetning = arrayTilKonjunksjon(arbeidsland.map(land => KV.objektTilTerm(land)));

    const virksomhetLandListe = valgteVirksomheter
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
                <dt>Arbeidsland er:</dt>
                <dd>{arbeidsLandSetning}</dd>
                <dt>Arbeidsgiver / selvstendig næringsdrivende har virksomhet i:</dt>
                <dd>{virksomhetsLandSetning}</dd>
                <dt>Søker er bosatt i:</dt>
                <dd>{KV.objektTilTerm(bostedsland)}</dd>
              </dl>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Fieldset legend="Velg riktig artikkel:">
                <Nav.Radio
                  name="artikkel11"
                  onChange={this.radioEndringHandler}
                  value={this.ART11_4_1}
                  checked={art11_4_1.oppfylt === true && art11_3A.oppfylt === true}
                  label="11.4 i - Norge er arbeidslandet"
                  disabled={!redigerbart}
                />
                <Nav.Radio
                  name="artikkel11"
                  onChange={this.radioEndringHandler}
                  value={this.ART11_4_2}
                  checked={art11_4_2.oppfylt === true}
                  label="11.4 ii - arbeidsgiver i bostedslandet"
                  disabled={!redigerbart}
                />
                <Nav.Radio
                  name="artikkel11"
                  onChange={this.radioEndringHandler}
                  value={this.TIL_VURDERING_12_1}
                  checked={art11_4_1.oppfylt === true && art11_3A.oppfylt === undefined}
                  label="11.4 i - arbeidslandet er ikke Norge, men jeg vil vurdere Artikkel 12.1"
                  disabled={!redigerbart}
                />
              </Nav.Fieldset>
              { visNISAvsnitt && (
                <Nav.Fieldset legend="Jobber søker i hotell- eller restaurantnæring på NIS-registrert skip?">
                  <Nav.Radio name="nis" disabled={!redigerbart} checked={nis.oppfylt === BOOLSK.USANN} onChange={this.nisEndret} value={BOOLSK.USANN} label="Nei" />
                  <Nav.Radio name="nis" disabled={!redigerbart} checked={nis.oppfylt === BOOLSK.SANN} onChange={this.nisEndret} value={BOOLSK.SANN} label="Ja" />
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
  arbeidsland: PT.arrayOf(MPT.Kodeverk),
  valgteVirksomheter: PT.arrayOf(MPT.Kodeverk),
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  artikkel: MPT.Kodeverk,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
};

VurderingArtikkel11_4.defaultProps = {
  tilstand: {},
  artikkel: {},
  bostedsland: {},
  arbeidsland: [],
  valgteVirksomheter: {},
};

export default VurderingArtikkel11_4;
