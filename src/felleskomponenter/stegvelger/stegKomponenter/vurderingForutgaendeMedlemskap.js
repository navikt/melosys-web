import React, { useEffect } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';

import EnkeltVilkaar from './felles/enkeltVilkaar';

const VurderingForutgaendeMedlemskap = props => {
  const {
    bekreftOgFortsett, begrunnelser, tilstand, redigerbart, oppdaterData, slettData,
  } = props;
  const { harAvklaring, forutgaendeMedlemskap } = tilstand;

  useEffect(() => (
    function cleanup() {
      slettData();
    }
  ), []);

  return (
    <div>
      <Nav.typo.Undertittel>Har søkeren tilstrekkelig forutgående medlemskap i folketrygden?</Nav.typo.Undertittel>
      <EnkeltVilkaar
        redigerbart={redigerbart}
        vilkaar={forutgaendeMedlemskap}
        vilkaarKode="forutgaendeMedlemskap"
        labelOppfylt="Ja"
        labelIkkeOppfylt="Nei"
        begrunnelser={begrunnelser}
        oppdaterData={oppdaterData}
      />
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!(redigerbart && harAvklaring)} className="fane__navigasjonsknapp" data-cy-nesteknapp="knapp_steg5" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingForutgaendeMedlemskap.ID = 'FORUTGAENDE_MEDLEMSKAP';

VurderingForutgaendeMedlemskap.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

VurderingForutgaendeMedlemskap.defaultProps = {
  tilstand: {},
  begrunnelser: [],
};

export default VurderingForutgaendeMedlemskap;
