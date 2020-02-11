import React, { useEffect } from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import EnkeltVilkaar from './felles/enkeltVilkaar';

import { arrayTilKonjunksjon } from '../../../utils/streng';

const NormaltDriverVirksomhet = props => {
  const {
    bekreftOgFortsett, begrunnelser, tilstand, redigerbart, oppdaterData, slettData, valgteVirksomheter,
  } = props;

  useEffect(() => (
    function cleanup() {
      slettData();
    }
  ), []);

  const { harAvklaring, normaltDriverVirksomhet } = tilstand;

  const arbeidsgivereTekst = valgteVirksomheter.length > 0 ? `${arrayTilKonjunksjon(valgteVirksomheter.map(virksomhet => virksomhet.navn))}` : '';

  return (
    <div>
      <Nav.typo.Undertittel>Driver {arbeidsgivereTekst} vanligvis virksomhet i Norge?</Nav.typo.Undertittel>
      <EnkeltVilkaar
        oppdaterData={oppdaterData}
        labelOppfylt="Ja"
        labelIkkeOppfylt="Nei"
        begrunnelser={begrunnelser}
        redigerbart={redigerbart}
        vilkaar={normaltDriverVirksomhet}
        vilkaarKode="normaltDriverVirksomhet"
      />
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!harAvklaring || !redigerbart} className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

NormaltDriverVirksomhet.ID = 'NORMALT_DRIVER_VIRKSOMHET';

NormaltDriverVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  valgteVirksomheter: PT.arrayOf(MPT.Virksomhet),
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

NormaltDriverVirksomhet.defaultProps = {
  tilstand: {},
  valgteVirksomheter: [],
  begrunnelser: [],
};

export default NormaltDriverVirksomhet;
