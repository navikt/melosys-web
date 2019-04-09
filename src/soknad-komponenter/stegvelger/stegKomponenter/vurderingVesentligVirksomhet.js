import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import * as Skjema from '../../skjema';

import { arrayTilKonjunksjon } from '../../../utils/streng';

import { BOOLSK } from '../../../constants';
import { konverterTilRessurs, lagBegrunnelse, lagVilkaar } from '../../../regler/vilkar';

class VurderingVesentligVirksomhet extends Component {
  componentDidMount() {
    const { oppdaterRessurs, settSkjemaVerdi, tilstand } = this.props;
    const { vesentligVirksomhetVilkaar } = tilstand;
    oppdaterRessurs(konverterTilRessurs('vesentligVirksomhet', vesentligVirksomhetVilkaar));
    settSkjemaVerdi('vilkar.vesentligVirksomhetBegrunnelser', vesentligVirksomhetVilkaar.begrunnelseKoder || []);
  }

  componentWillUnmount() {
    const { slettAllStegdata } = this.props;
    slettAllStegdata();
  }

  radioEndringHandler = event => {
    const { oppdaterRessurs } = this.props;
    oppdaterRessurs(lagVilkaar('vesentligVirksomhet', event.target.value));
  };

  listeVelgerHandler = event => {
    const { oppdaterRessurs } = this.props;
    oppdaterRessurs(lagBegrunnelse('vesentligVirksomhet', event.value));
  };

  render () {
    const {
      bekreftOgFortsett, begrunnelser, tilstand, redigerbart,
    } = this.props;
    const { vesentligVirksomhetVilkaar, visBegrunnelser, harAvklaring } = tilstand;

    const arbeidsgivereTekst = this.props.valgteVirksomheter.length > 0 ? `til ${arrayTilKonjunksjon(this.props.valgteVirksomheter.map(arbeidsgiver => arbeidsgiver.navn))}` : '';
    return (
      <div>
        <Nav.Undertittel>Vurdering av vesentlig virksomhet {arbeidsgivereTekst}</Nav.Undertittel>
        <div className="vurderingVesentligVirksomhet__skjemafelt">
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Fieldset legend="Virksomheten har:">
                <Nav.Radio
                  name="vesentligVirksomhet"
                  disabled={!redigerbart}
                  onChange={this.radioEndringHandler}
                  checked={vesentligVirksomhetVilkaar.oppfylt === true}
                  value={BOOLSK.SANN}
                  label="Vesentlig virksomhet" />
                <Nav.Radio
                  name="vesentligVirksomhet"
                  disabled={!redigerbart}
                  onChange={this.radioEndringHandler}
                  checked={vesentligVirksomhetVilkaar.oppfylt === false}
                  value={BOOLSK.USANN}
                  label="Ikke vesentlig virksomhet" />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
          {visBegrunnelser && (
            <Nav.Row>
              <Nav.Column xs="12" md="10" lg="8">
                <Nav.Fieldset legend="Begrunnelse:">
                  <Skjema.ListeVelger
                    feltNavn="vilkar.vesentligVirksomhetBegrunnelser"
                    muligeValg={begrunnelser}
                    disabled={!redigerbart}
                    label="Legg til begrunnelse:"
                    onChange={this.listeVelgerHandler}
                    gruppe
                    tillatFritekst={false}
                  />
                </Nav.Fieldset>
              </Nav.Column>
            </Nav.Row>)
          }
        </div>
        <div className="fane__knapplinje">
          <Nav.Knapp disabled={!(redigerbart && harAvklaring)} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </div>
    );
  }
}

VurderingVesentligVirksomhet.ID = 'VESENTLIG_VIRKSOMHET';

VurderingVesentligVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  valgteVirksomheter: PT.array,
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
  settSkjemaVerdi: PT.func.isRequired,
  oppdaterRessurs: PT.func.isRequired,
  slettAllStegdata: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

VurderingVesentligVirksomhet.defaultProps = {
  tilstand: {},
  valgteVirksomheter: [],
  begrunnelser: [],
};

export default VurderingVesentligVirksomhet;
