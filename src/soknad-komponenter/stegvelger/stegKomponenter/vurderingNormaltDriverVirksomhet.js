import React, { useEffect } from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import EnkeltVilkaar from './felles/enkeltVilkaar';

import { arrayTilKonjunksjon } from '../../../utils/streng';

const NormaltDriverVirksomhet = props => {
  const {
    bekreftOgFortsett, begrunnelser, tilstand, redigerbart, oppdaterData, slettData,
  } = props;

  useEffect(() => (
    function cleanup() {
      slettData();
    }
  ), []);

  const { harAvklaring, normaltDriverVirksomhet } = tilstand;
  const arbeidsgivereTekst = props.valgteVirksomheter.length > 0 ? `til ${arrayTilKonjunksjon(props.valgteVirksomheter.map(arbeidsgiver => arbeidsgiver.navn))}` : '';

  return (
    <div>
      <Nav.Undertittel>Vurdering av selvstendig virksomhet til {arbeidsgivereTekst}</Nav.Undertittel>
      <EnkeltVilkaar
        oppdaterData={oppdaterData}
        tittel="Virksomheten har:"
        labelOppfylt="Driver normalt virksomhet i Norge"
        labelIkkeOppfylt="Driver normalt ikke virksomhet i Norge"
        begrunnelser={begrunnelser}
        redigerbart={redigerbart}
        vilkaar={normaltDriverVirksomhet}
        vilkaarKode="normaltDriverVirksomhet"
      />
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!harAvklaring || !redigerbart} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

NormaltDriverVirksomhet.ID = 'NORMALT_DRIVER_VIRKSOMHET';

NormaltDriverVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  valgteVirksomheter: PT.array,
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
