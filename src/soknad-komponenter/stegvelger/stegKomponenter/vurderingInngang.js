import React, { useEffect } from 'react';
import { FieldArray, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as MPT from '../../../proptypes/';
import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';

import { avklartefaktaSelectors } from '../../../ducks/avklartefakta';
import { soknadSelectors } from '../../../ducks/soknad';

import SoknadslandListe from './inngang/soknadslandListe';

const VurderingInngang = props => {
  const {
    bekreftOgFortsett, inngangsvilkar, alleLandkoder, begrunnelser, avklartefakta,
    tilstand, redigerbart, oppdaterData, slettData,
  } = props;

  useEffect(() => function cleanup() {
    slettData();
  }, []);

  const { vurdering } = inngangsvilkar;
  const soknadslandBegrunnelser = begrunnelser.opphold;
  const { harAvklaring } = tilstand;

  return (
    <div className="vurderingInngang">
      <Nav.Undertittel>Kontroller inngangsvilkår</Nav.Undertittel>
      <ul className="betingelser__liste">
        <li className="liste__element liste__element--oppfylt">
          { KV.objektTilTerm(vurdering) }
        </li>
        <li className="liste__element liste__element--varsel">
          Sjekk at land er innenfor et territorium / område som dekkes av forordningen.
        </li>
      </ul>
      <FieldArray
        name="avklartefakta.soknadsland"
        component={SoknadslandListe}
        avklartefakta={avklartefakta}
        soknadslandBegrunnelser={soknadslandBegrunnelser}
        alleLandkoder={alleLandkoder}
        redigerbart={redigerbart}
        oppdaterData={oppdaterData}
      />
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!(redigerbart && harAvklaring)} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingInngang.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  avklartefakta: MPT.AvklartefaktaListe.isRequired,
  alleLandkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  begrunnelser: PT.object.isRequired,
  tilstand: PT.object.isRequired,
  inngangsvilkar: PT.shape({
    vurdering: MPT.Kodeverk,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
};

const mapStateToProps = state => ({
  initialValues: {
    avklartefakta: {
      soknadsland: avklartefaktaSelectors.Soknadsland(state),
    },
    soknadsland: soknadSelectors.SoknadslandSelector(state),
  },
});

const VurderingInngangForm = reduxForm({
  form: KV.Form.INNGANG,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})(VurderingInngang);

export default connect(mapStateToProps)(VurderingInngangForm);
