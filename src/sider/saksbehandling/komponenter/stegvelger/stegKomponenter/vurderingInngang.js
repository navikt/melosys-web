import React, { useEffect } from 'react';
import { FieldArray, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as MPT from '../../../../../proptypes';
import * as Nav from '../../../../../utils/navFrontend';
import * as KV from '../../../../../kodeverk';

import { soknadSelectors } from '../../../../../ducks/soknad';

import SoknadslandListe from './inngang/soknadslandListe';

const VurderingInngang = props => {
  const {
    bekreftOgFortsett, alleLandkoder, begrunnelser, avklartefakta,
    tilstand, redigerbart, oppdaterData, slettData,
  } = props;

  useEffect(() => (
    function cleanup() {
      slettData();
    }
  ), []);

  const soknadslandBegrunnelser = begrunnelser.opphold;
  const { harAvklaring } = tilstand;

  return (
    <div className="vurderingInngang">
      <Nav.typo.Undertittel>Kontroller inngangsvilkår</Nav.typo.Undertittel>
      <ul className="betingelser__liste">
        <li className="liste__element liste__element--oppfylt">
          Søknaden oppfyller inngangsvilkårene for EU/EØS-saker etter forordning 883/2004.
        </li>
        <li className="liste__element liste__element--varsel">
          Sjekk eventuelt at området dekkes av forordningen.
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
        <Nav.Knapp disabled={!(redigerbart && harAvklaring)} className="fane__navigasjonsknapp" data-cy-nesteknapp="knapp_steg0" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
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
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
};

const mapStateToProps = state => ({
  initialValues: {
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
