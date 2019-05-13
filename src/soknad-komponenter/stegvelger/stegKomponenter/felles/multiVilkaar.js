import React, { Component } from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../../utils/navFrontend';
import { konverterTilStegData, lagBegrunnelse, lagVilkaar } from '../../../../regler/vilkar';

import ListevelgerFlervalg from '../../../../komponenter/ui/listevelgerFlervalg';

class MultiVilkaar extends Component {
  constructor() {
    super();
    this.VilkaarKode16 = MKV.Koder.vilkaar.FO_883_2004_ART16_1;
    this.AVSLAG = 'AVSLAG';
  }

  componentDidMount() {
    const {
      oppdaterData, vilkaar12, vilkaarKode12, vilkaar16,
    } = this.props;
    oppdaterData(konverterTilStegData(vilkaarKode12, vilkaar12));
    oppdaterData(konverterTilStegData('art16_1', vilkaar16));
  }

  vilkaarEndret = event => {
    const { value } = event.target;
    const { oppdaterData, slettData, vilkaarKode12 } = this.props;

    if (value === vilkaarKode12) {
      oppdaterData(lagVilkaar(vilkaarKode12, true));
      slettData('vilkaar', 'art16_1');
    } else if (value === this.VilkaarKode16) {
      oppdaterData(lagVilkaar(vilkaarKode12, false));
      oppdaterData(lagVilkaar('art16_1', true));
    } else if (value === this.AVSLAG) {
      oppdaterData(lagVilkaar(vilkaarKode12, false));
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
      redigerbart, vilkaar12, vilkaarKode12, vilkaarNavn12, begrunnelser12, vilkaar16,
    } = this.props;

    const innvilgelse = vilkaar12.oppfylt;
    const anmodningOmUnntak = vilkaar12.oppfylt === false && vilkaar16.oppfylt === true;
    const avslag = vilkaar12.oppfylt === false && vilkaar16.oppfylt === false;

    return (
      <div>
        <Nav.Undertittel>{`Vurdering av artikkel ${vilkaarNavn12}`}</Nav.Undertittel>
        <div>
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Fieldset legend={`Fyller søker kriterier for artikkel ${vilkaarNavn12}?`}>
                <Nav.Radio
                  name="artikkel12"
                  onChange={this.vilkaarEndret}
                  value={vilkaarKode12}
                  checked={innvilgelse === true}
                  label="Ja"
                  disabled={!redigerbart}
                />
                <Nav.Radio
                  name="artikkel12"
                  onChange={this.vilkaarEndret}
                  value={this.VilkaarKode16}
                  checked={anmodningOmUnntak === true}
                  label="Nei, jeg vil vurdere artikkel 16.1"
                  disabled={!redigerbart}
                />
                <Nav.Radio
                  name="artikkel12"
                  onChange={this.vilkaarEndret}
                  value={this.AVSLAG}
                  checked={avslag === true}
                  label={`Nei, jeg vil avslå søknaden etter artikkel ${vilkaarNavn12} og 16.1`}
                  disabled={!redigerbart}
                />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12" md="10" lg="8">
              { vilkaar12.oppfylt === false && (
                <Nav.Fieldset legend={`Begrunnelse artikkel ${vilkaarNavn12}:`}>
                  <ListevelgerFlervalg
                    muligeValg={begrunnelser12}
                    label="Legg til begrunnelse for ikke oppfylt:"
                    tillatFritekst={false}
                    onChange={e => this.begrunnelseEndret(e, vilkaarKode12)}
                    defaultElementer={vilkaar12.begrunnelseKoder}
                    disabled={!redigerbart}
                  />
                </Nav.Fieldset>
              )}
              { vilkaar16.oppfylt === false && (
                <Nav.Fieldset legend="Begrunnelse artikkel 16.1:">
                  <ListevelgerFlervalg
                    muligeValg={MKV.KTObjects.begrunnelser.art16_1_avslag}
                    label="Legg til begrunnelse for avslag:"
                    tillatFritekst={false}
                    onChange={e => this.begrunnelseEndret(e, 'art16_1')}
                    defaultElementer={vilkaar16.begrunnelseKoder}
                    disabled={!redigerbart}
                  />
                  <Nav.Textarea
                    id="art16_1"
                    label="Begrunnelse for avslag (fritekst):"
                    maxLength={255}
                    bredde="fullbredde"
                    value={vilkaar16.begrunnelseFritekst || ''}
                    onChange={this.fritekstEndret}
                    disabled={!redigerbart}
                  />
                </Nav.Fieldset>
              )}
            </Nav.Column>
          </Nav.Row>
        </div>
      </div>
    );
  }
}

MultiVilkaar.propTypes = {
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  vilkaar12: PT.object.isRequired,
  vilkaarNavn12: PT.string.isRequired,
  vilkaarKode12: PT.string.isRequired,
  begrunnelser12: PT.array.isRequired,
  vilkaar16: PT.object.isRequired,
};

MultiVilkaar.defaultProps = {
};

export default MultiVilkaar;
