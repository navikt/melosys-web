import React, { Component } from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';

import ListevelgerFlervalg from '../../../komponenter/ui/listevelgerFlervalg';

import { arrayTilKonjunksjon } from '../../../utils/streng';

import { BOOLSK } from '../../../constants';
import { konverterTilStegData, lagBegrunnelse, lagVilkaar } from '../../../regler/vilkar';

class NormaltDriverVirksomhet extends Component {
  componentDidMount() {
    const { oppdaterData, tilstand } = this.props;
    oppdaterData(konverterTilStegData('normaltDriverVirksomhet', tilstand.normaltDriverVirksomhet));
  }

  componentWillUnmount() {
    this.props.slettAllDataForSteg();
  }

  radioEndringHandler = event => {
    const { oppdaterData } = this.props;
    oppdaterData(lagVilkaar('normaltDriverVirksomhet', event.target.value));
  };

  listevalgEndringHandler = event => {
    const { oppdaterData } = this.props;
    oppdaterData(lagBegrunnelse('normaltDriverVirksomhet', event.value));
  };

  render () {
    const {
      bekreftOgFortsett, begrunnelser, tilstand, redigerbart,
    } = this.props;

    const { visBegrunnelser, harAvklaring, normaltDriverVirksomhet } = tilstand;
    const arbeidsgivereTekst = this.props.valgteVirksomheter.length > 0 ? `til ${arrayTilKonjunksjon(this.props.valgteVirksomheter.map(arbeidsgiver => arbeidsgiver.navn))}` : '';

    return (
      <div>
        <Nav.Undertittel>Vurdering av selvstendig virksomhet til {arbeidsgivereTekst}</Nav.Undertittel>
        <div className="vurderingBostedsland__skjemafelt">
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Fieldset legend="Virksomheten har:">
                <Nav.Radio
                  name="normaltDriverVirksomhet"
                  label="Driver normalt virksomhet i Norge"
                  value={BOOLSK.SANN}
                  checked={normaltDriverVirksomhet.oppfylt === BOOLSK.SANN}
                  onChange={this.radioEndringHandler}
                  disabled={!redigerbart}
                />
                <Nav.Radio
                  name="normaltDriverVirksomhet"
                  label="Driver normalt IKKE virksomhet i Norge"
                  value={BOOLSK.USANN}
                  checked={normaltDriverVirksomhet.oppfylt === BOOLSK.USANN}
                  onChange={this.radioEndringHandler}
                  disabled={!redigerbart}
                />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
          {visBegrunnelser && (
            <Nav.Row>
              <Nav.Column xs="12" md="10" lg="8">
                <Nav.Fieldset legend="Begrunnelse:">
                  <ListevelgerFlervalg
                    muligeValg={begrunnelser}
                    label="Legg til begrunnelse:"
                    tillatFritekst={false}
                    onChange={this.listevalgEndringHandler}
                    defaultElementer={normaltDriverVirksomhet.begrunnelseKoder}
                    disabled={!redigerbart}
                  />
                </Nav.Fieldset>
              </Nav.Column>
            </Nav.Row>)
          }
        </div>
        <div className="fane__knapplinje">
          <Nav.Knapp disabled={!harAvklaring || !redigerbart} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </div>
    );
  }
}

NormaltDriverVirksomhet.ID = 'NORMALT_DRIVER_VIRKSOMHET';

NormaltDriverVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  valgteVirksomheter: PT.array,
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
  oppdaterData: PT.func.isRequired,
  slettAllDataForSteg: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

NormaltDriverVirksomhet.defaultProps = {
  tilstand: {},
  valgteVirksomheter: [],
  begrunnelser: [],
};

export default NormaltDriverVirksomhet;
