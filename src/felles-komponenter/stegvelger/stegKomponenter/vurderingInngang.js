import React from 'react';
import { FieldArray } from 'redux-form';
import PT from 'prop-types';

import * as MPT from '../../../proptypes/';
import * as Nav from '../../../utils/navFrontend';

import { kodeverkObjektTilTerm } from '../../../utils/kodeverk';

import OppholdsLandListe from './inngang/oppholdsLandListe';

const VurderingInngang = props => {
  const {
    bekreftOgFortsett, inngangsvilkar, alleLandKoder, begrunnelser, avklartefakta, tilstand, redigerbart,
  } = props;
  const { vurdering } = inngangsvilkar;
  const oppholdBegrunnelser = begrunnelser.opphold;
  const { harAvklaring } = tilstand;

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
      <FieldArray
        name="avklartefakta.oppholdsland"
        component={OppholdsLandListe}
        avklartefakta={avklartefakta}
        oppholdBegrunnelser={oppholdBegrunnelser}
        alleLandKoder={alleLandKoder}
        redigerbart={redigerbart}
      />
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!(redigerbart && harAvklaring)} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Start behandling</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingInngang.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  avklartefakta: PT.array.isRequired,
  alleLandKoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  begrunnelser: PT.object.isRequired,
  tilstand: PT.object.isRequired,
  inngangsvilkar: PT.shape({
    vurdering: MPT.Kodeverk,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
};

export default VurderingInngang;
