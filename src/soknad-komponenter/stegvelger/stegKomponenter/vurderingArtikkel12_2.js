import React, { Component } from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from './../../../proptypes';

import ListevelgerFlervalg from '../../../komponenter/ui/listevelgerFlervalg';
import { konverterTilStegData, lagBegrunnelse, lagVilkaar } from '../../../regler/vilkar';

class VurderingArtikkel12_2 extends Component {
  /* Bakgrunn: Hvert vilkår er uttrykt som en two-state, dvs true eller false i domenemodellen. Problemet
   * med de 3 radiovalgene i grensesnittet er at disse ville representert en tri-state ("ja", "nei, men..." og "nei").
   */
  constructor() {
    super();
    this.AVSLAG = 'AVSLAG';
  }

  componentDidMount() {
    const { oppdaterData, tilstand } = this.props;
    const { art12_2, art16_1 } = tilstand;
    oppdaterData(konverterTilStegData('art12_2', art12_2));
    oppdaterData(konverterTilStegData('art16_1', art16_1));
  }

  componentWillUnmount() {
    this.props.slettAllDataForSteg();
  }

  radioEndringHandler = event => {
    const { value } = event.target;
    const { oppdaterData, slettData } = this.props;

    if (value === MKV.Koder.vilkaar.FO_883_2004_ART12_2) {
      oppdaterData(lagVilkaar('art12_2', true));
      slettData('vilkaar', 'art16_1');
    } else if (value === MKV.Koder.vilkaar.FO_883_2004_ART16_1) {
      oppdaterData(lagVilkaar('art12_2', false));
      oppdaterData(lagVilkaar('art16_1', true));
    } else if (value === this.AVSLAG) {
      oppdaterData(lagVilkaar('art12_2', false));
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
      art12_2,
      art16_1,
      art16_1_fritekst,
      visBegrunnelser12,
      visBegrunnelser16,
      harAvklaring,
    } = tilstand;

    const innvilgelse = art12_2.oppfylt;
    const anmodningOmUnntak = art12_2.oppfylt === false && art16_1.oppfylt === true;
    const avslag = art12_2.oppfylt === false && art16_1.oppfylt === false;

    return (
      <div>
        <Nav.Undertittel>Vurdering av artikkel 12. 2</Nav.Undertittel>
        <div>
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Fieldset legend="Fyller søker kriterier for artikkel 12.2?">
                <Nav.Radio
                  name="artikkel"
                  onChange={this.radioEndringHandler}
                  value={MKV.Koder.vilkaar.FO_883_2004_ART12_2}
                  checked={innvilgelse === true}
                  label="Ja"
                  disabled={!redigerbart}
                />
                <Nav.Radio
                  name="artikkel"
                  onChange={this.radioEndringHandler}
                  value={MKV.Koder.vilkaar.FO_883_2004_ART16_1}
                  checked={anmodningOmUnntak === true}
                  label="Nei, jeg vil sende anmodning om unntak etter artikkel 16.1"
                  disabled={!redigerbart}
                />
                <Nav.Radio
                  name="artikkel"
                  onChange={this.radioEndringHandler}
                  value={this.AVSLAG}
                  checked={avslag === true}
                  label="Nei, jeg vil avslå søknaden etter artikkel 12.2 og 16.1"
                  disabled={!redigerbart}
                />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12" md="10" lg="8">
              { visBegrunnelser12 && (
                <Nav.Fieldset legend="Begrunnelse artikkel 12.2:">
                  <ListevelgerFlervalg
                    muligeValg={MKV.KTObjects.begrunnelser.art12_2_begrunnelser}
                    label="Legg til begrunnelse for ikke oppfylt:"
                    tillatFritekst={false}
                    onChange={e => this.begrunnelseEndret(e, 'art12_2')}
                    defaultElementer={art12_2.begrunnelseKoder}
                    disabled={!redigerbart}
                  />
                </Nav.Fieldset>
              )}
              { visBegrunnelser16 && (
                <Nav.Fieldset legend="Begrunnelse artikkel 16.1:">
                  <ListevelgerFlervalg
                    muligeValg={MKV.KTObjects.begrunnelser.art16_1_avslag}
                    label="Legg til begrunnelse for avslag:"
                    tillatFritekst={false}
                    onChange={e => this.begrunnelseEndret(e, 'art16_1')}
                    defaultElementer={art16_1.begrunnelseKoder}
                    disabled={!redigerbart}
                  />
                  <Nav.Textarea
                    id="art16_1"
                    label="Begrunnelse for avslag (fritekst):"
                    maxLength={255}
                    bredde="fullbredde"
                    value={art16_1_fritekst}
                    onChange={this.fritekstEndret}
                    disabled={!redigerbart}
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

VurderingArtikkel12_2.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  artikkel: MPT.Kodeverk,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  slettAllDataForSteg: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

VurderingArtikkel12_2.defaultProps = {
  tilstand: {},
  artikkel: {},
};

export default VurderingArtikkel12_2;
