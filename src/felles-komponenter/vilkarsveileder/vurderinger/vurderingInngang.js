import React from 'react';
import { FieldArray } from 'redux-form';
import PT from 'prop-types';

import * as MPT from '../../../proptypes/';
import * as Nav from '../../../utils/navFrontend';

import { kodeverkObjektTilTerm } from '../../../utils/kodeverk';

import OppholdsLandListe from './inngang/oppholdsLandListe';

import './vurderingInngang.css';

const VurderingInngang = props => {
  const {
    bekreftOgFortsett, inngangsvilkar, landkoder, begrunnelser,
  } = props;
  const { vurdering } = inngangsvilkar;
  const { opphold: oppholdBegrunnelser } = begrunnelser;

  return (
    <div className="vurderingInngang">
      <Nav.Undertittel>Kontroller inngangsvilkår</Nav.Undertittel>
      <ul className="betingelser__liste">
        <li className="liste__element liste__element--oppfylt">
          { kodeverkObjektTilTerm(vurdering) }
        </li>
        <li className="liste__element liste__element--varsel">
          Sjekk at land er innenfor et territorium / område som dekkes av forordningen.
        </li>
      </ul>
      <div>
        <FieldArray name="faktaavklaringOppholdsLand" component={OppholdsLandListe} oppholdBegrunnelser={oppholdBegrunnelser} landkoder={landkoder} />
      </div>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Start behandling</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingInngang.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  faktaavklaring: PT.object.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  begrunnelser: PT.object.isRequired,
  inngangsvilkar: PT.shape({
    vurdering: MPT.Kodeverk,
  }).isRequired,
};

export default VurderingInngang;
