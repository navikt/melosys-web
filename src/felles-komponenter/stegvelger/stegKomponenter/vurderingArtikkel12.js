import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import * as MPT from './../../../proptypes';

import { kodeverkObjektTilTerm } from '../../../utils/kodeverk';
import { BOOLSK } from '../../../constants';

const VurderingArtikkel12 = props => {
  const {
    bekreftOgFortsett, begrunnelser, artikkel, tilstand,
  } = props;

  const { visBegrunnelser } = tilstand;

  return (
    <div>
      <Nav.Undertittel>Vurdering av artikkel {kodeverkObjektTilTerm(artikkel)}</Nav.Undertittel>
      <div>
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Fieldset legend={`Fyller søker kriteriene for artikkel ${kodeverkObjektTilTerm(artikkel)}?`}>
              <Skjema.Radio feltNavn="vilkar.art12_1" value={BOOLSK.SANN} label="Ja" />
              <Skjema.Radio feltNavn="vilkar.art12_1" value={BOOLSK.USANN} label="Nei, jeg vil vurdere artikkel 16.1" />
              <Skjema.Radio feltNavn="vilkar.art12_1" value={BOOLSK.USANN} label={`Nei, jeg vil avslå søknaden etter artikkel ${kodeverkObjektTilTerm(artikkel)} og 16.1`} />
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
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingArtikkel12.propTypes = {
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  artikkel: MPT.Kodeverk,
};

VurderingArtikkel12.defaultProps = {
  tilstand: {},
  artikkel: {},
};

export default VurderingArtikkel12;
