import React from 'react';
import PT from 'prop-types';
import * as MPT from '../../../proptypes/';
import * as Nav from '../../../utils/navFrontend';

import { kodeverkObjektTilTerm } from '../../../utils/kodeverk';

import './vurderingVedtak.css';

const VurderingInngang = props => {
  const { bekreftOgFortsett, inngangsvilkar, faktaavklaring } = props;
  const { vurdering } = inngangsvilkar;
  const { opphold } = faktaavklaring;

  console.log(opphold);

  return (
    <div className="inngang vedtak">
      <Nav.Undertittel>Kontroller inngangsvilkår</Nav.Undertittel>
        <ul className="betingelser__liste">
          <li className="liste__element liste__element--oppfylt">
            { kodeverkObjektTilTerm(vurdering) }
          </li>
          <li className="liste__element liste__element--varsel">
            Sjekk at land er innenfor et territorium / område som dekkes av forordningen.
          </li>
        </ul>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Start behandling</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingInngang.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  faktaavklaring: PT.object.isRequired,
  inngangsvilkar: PT.shape({
    vurdering: MPT.Kodeverk,
  }).isRequired,
};

export default VurderingInngang;
