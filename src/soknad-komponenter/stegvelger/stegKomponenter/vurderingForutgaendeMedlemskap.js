import React, { Component } from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import * as Skjema from '../../skjema';

import { BOOLSK } from '../../../constants';
import { konverterTilStegData, lagBegrunnelse, lagVilkaar } from '../../../regler/vilkar';

class VurderingForutgaendeMedlemskap extends Component {
  componentDidMount() {
    const { oppdaterData, settSkjemaVerdi, tilstand } = this.props;
    const { forutgaendeMedlemskap } = tilstand;
    oppdaterData(konverterTilStegData('forutgaendeMedlemskap', forutgaendeMedlemskap));
    settSkjemaVerdi('vilkar.forutgaendeMedlemskapBegrunnelser', forutgaendeMedlemskap.begrunnelseKoder || []);
  }

  componentWillUnmount() {
    const { slettAllDataForSteg } = this.props;
    slettAllDataForSteg();
  }

  radioEndringHandler = event => {
    const { oppdaterData } = this.props;
    oppdaterData(lagVilkaar('forutgaendeMedlemskap', event.target.value));
  };

  listevalgEndringHandler = event => {
    const { oppdaterData } = this.props;
    oppdaterData(lagBegrunnelse('forutgaendeMedlemskap', event.value));
  };

  render() {
    const {
      bekreftOgFortsett, begrunnelser, tilstand, redigerbart,
    } = this.props;
    const { visBegrunnelser, harAvklaring, forutgaendeMedlemskap } = tilstand;

    return (
      <div>
        <Nav.Undertittel>Vurdering av forutgående medlemskap</Nav.Undertittel>
        <div>
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Fieldset legend="Søkeren har:" disabled={!redigerbart}>
                <Nav.Radio
                  name="forutgaendeMedlemskap"
                  disabled={!redigerbart}
                  onChange={this.radioEndringHandler}
                  checked={forutgaendeMedlemskap.oppfylt === true}
                  value={BOOLSK.SANN}
                  label="Har forutgående medlemskap" />
                <Nav.Radio
                  name="forutgaendeMedlemskap"
                  disabled={!redigerbart}
                  onChange={this.radioEndringHandler}
                  checked={forutgaendeMedlemskap.oppfylt === false}
                  value={BOOLSK.USANN}
                  label="Har ikke forutgående medlemskap" />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
          { visBegrunnelser && (
            <Nav.Row>
              <Nav.Column xs="12" md="10" lg="8">
                <Nav.Fieldset legend="Begrunnelse:">
                  <Skjema.ListeVelger
                    feltNavn="vilkar.forutgaendeMedlemskapBegrunnelser"
                    muligeValg={begrunnelser}
                    label="Legg til begrunnelse:"
                    gruppe
                    tillatFritekst={false}
                    disabled={!redigerbart}
                    onChange={this.listevalgEndringHandler}
                  />
                </Nav.Fieldset>
              </Nav.Column>
            </Nav.Row>
          ) }
        </div>
        <div className="fane__knapplinje">
          <Nav.Knapp disabled={!(redigerbart && harAvklaring)} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </div>
    );
  }
}

VurderingForutgaendeMedlemskap.ID = 'FORUTGAENDE_MEDLEMSKAP';

VurderingForutgaendeMedlemskap.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
  settSkjemaVerdi: PT.func.isRequired,
  oppdaterData: PT.func.isRequired,
  slettAllDataForSteg: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

VurderingForutgaendeMedlemskap.defaultProps = {
  tilstand: {},
  begrunnelser: [],
};

export default VurderingForutgaendeMedlemskap;
