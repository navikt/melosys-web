import React, { Component } from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import * as MPT from './../../../proptypes';
import { konverterTilStegData, lagBegrunnelse, lagVilkaar } from '../../../regler/vilkar';

import ListevelgerFlervalg from '../../../komponenter/ui/listevelgerFlervalg';

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
    this.ART12_1 = MKV.Koder.vilkaar.FO_883_2004_ART12_1;
    this.ART16_1 = MKV.Koder.vilkaar.FO_883_2004_ART16_1;
    this.AVSLAG = 'AVSLAG';
  }

  componentDidMount() {
    const { oppdaterData, settSkjemaVerdi, tilstand } = this.props;
    const { art12_1, art16_1 } = tilstand;
    oppdaterData(konverterTilStegData('art12_1', art12_1));
    oppdaterData(konverterTilStegData('art16_1', art16_1));

    settSkjemaVerdi('vilkar.art12_1_begrunnelser', art12_1.begrunnelseKoder || []);
    settSkjemaVerdi('vilkar.art16_1_begrunnelser', art16_1.begrunnelseKoder || []);
    settSkjemaVerdi('vilkar.art16_1_begrunnelser_fritekst', art16_1.begrunnelseFritekst || '');
  }

  componentWillUnmount() {
    const { slettAllDataForSteg } = this.props;
    slettAllDataForSteg();
  }

  vilkaarEndret = event => {
    const { value } = event.target;
    const { oppdaterData, slettData } = this.props;

    if (value === this.ART12_1) {
      oppdaterData(lagVilkaar('art12_1', true));
      slettData('vilkaar', 'art16_1');
    } else if (value === this.ART16_1) {
      oppdaterData(lagVilkaar('art12_1', false));
      oppdaterData(lagVilkaar('art16_1', true));
    } else if (value === this.AVSLAG) {
      oppdaterData(lagVilkaar('art12_1', false));
      oppdaterData(lagVilkaar('art16_1', false));
    }
  };

  begrunnelseEndret = ({ value }, id) => {
    const { oppdaterData } = this.props;
    oppdaterData(lagBegrunnelse(id, value));
  };

  fritekstEndret = event => {
    const { value, id } = event.target;
    const { oppdaterData } = this.props;
    oppdaterData(lagBegrunnelse(id, null, value));
  };

  render () {
    const {
      bekreftOgFortsett, tilstand, redigerbart,
    } = this.props;

    const {
      art12_1, art16_1, anmodningOmUnntak, visBegrunnelser12, visBegrunnelser16, harAvklaring,
    } = tilstand;

    return (
      <div>
        <Nav.Undertittel>Vurdering av artikkel 12.1</Nav.Undertittel>
        <div>
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Fieldset legend="Fyller søker kriterier for artikkel 12.1?">
                <Nav.Radio
                  name="artikkel12"
                  onChange={this.vilkaarEndret}
                  value={this.ART12_1}
                  checked={art12_1.oppfylt === true}
                  label="Ja"
                  disabled={!redigerbart}
                />
                <Nav.Radio
                  name="artikkel12"
                  onChange={this.vilkaarEndret}
                  value={this.ART16_1}
                  checked={anmodningOmUnntak === true}
                  label="Nei, jeg vil vurdere artikkel 16.1"
                  disabled={!redigerbart}
                />
                <Nav.Radio
                  name="artikkel12"
                  onChange={this.vilkaarEndret}
                  value={this.AVSLAG}
                  checked={art12_1.oppfylt === false && !anmodningOmUnntak}
                  label="Nei, jeg vil avslå søknaden etter artikkel 12.1 og 16.1"
                  disabled={!redigerbart}
                />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12" md="10" lg="8">
              { visBegrunnelser12 && (
                <Nav.Fieldset legend="Begrunnelse artikkel 12.1:">
                  <ListevelgerFlervalg
                    muligeValg={MKV.KTObjects.begrunnelser.art12_1_begrunnelser}
                    label="Legg til begrunnelse for ikke oppfylt:"
                    tillatFritekst={false}
                    disabled={!redigerbart}
                    onChange={e => this.begrunnelseEndret(e, 'art12_1')}
                    defaultElementer={art12_1.begrunnelseKoder}
                  />
                </Nav.Fieldset>
              )}
              { visBegrunnelser16 && (
                <Nav.Fieldset legend="Begrunnelse artikkel 16.1:">
                  <ListevelgerFlervalg
                    muligeValg={MKV.KTObjects.begrunnelser.art16_1_avslag}
                    label="Legg til begrunnelse for avslag:"
                    tillatFritekst={false}
                    disabled={!redigerbart}
                    onChange={e => this.begrunnelseEndret(e, 'art16_1')}
                    defaultElementer={art16_1.begrunnelseKoder}
                  />
                  <Skjema.Textarea
                    disabled={!redigerbart}
                    id="art16_1"
                    feltNavn="vilkar.art16_1_begrunnelser_fritekst"
                    label="Begrunnelse for avslag (fritekst):"
                    maxLength={255}
                    bredde="fullbredde"
                    onBlur={this.fritekstEndret}
                  />
                </Nav.Fieldset>
              )}
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

VurderingArtikkel12_1.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  artikkel: MPT.Kodeverk,
  settSkjemaVerdi: PT.func.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  slettAllDataForSteg: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

VurderingArtikkel12_1.defaultProps = {
  tilstand: {},
  artikkel: {},
};

export default VurderingArtikkel12_1;
