import React, { useEffect } from 'react';
import { FieldArray, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import PT from 'prop-types';
import classNames from 'classnames';

import * as MPT from '../../../proptypes';
import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';

import { avklartefaktaSelectors } from '../../../ducks/avklartefakta';
import { behandlingsgrunnlagSelectors } from '../../../ducks/behandlingsgrunnlag';

import MKV from '../../../melosyskodeverk';

import SoknadslandListe from './inngang/soknadslandListe';

export const Varsler = ({
  oppfyllerInngangsvilkar,
  inngangsvilkaarBegrunnelser,
}) => {
  const oppfyllerInngangsvilkarCl = classNames({
    liste__element: true,
    'liste__element--oppfylt': oppfyllerInngangsvilkar,
    'liste__element--ikkeoppfylt': !oppfyllerInngangsvilkar,
  });

  const varselCl = classNames({
    liste__element: true,
    'liste__element--varsel': true,
  });

  const oppfyltTekst = `Søknaden oppfyller${oppfyllerInngangsvilkar ? ' ' : ' ikke '}inngangsvilkårene for EU/EØS-saker etter forordning 883/2004.`;

  return (
    <ul className="betingelser__liste">
      <li className={oppfyllerInngangsvilkarCl}>{oppfyltTekst}</li>
      {
        !oppfyllerInngangsvilkar &&
        inngangsvilkaarBegrunnelser.map(begrunnelseKode => (
          <li key={begrunnelseKode} className={oppfyllerInngangsvilkarCl}>
            {KV.kodeTilTerm(begrunnelseKode, MKV.KTObjects.begrunnelser.inngangsvilkaar)}
          </li>
        ))
      }
      {
        oppfyllerInngangsvilkar &&
        <li className={varselCl}>Sjekk eventuelt at området dekkes av forordningen.</li>
      }
    </ul>
  );
};

Varsler.propTypes = {
  oppfyllerInngangsvilkar: PT.bool.isRequired,
  inngangsvilkaarBegrunnelser: PT.arrayOf(PT.string).isRequired,
};

export const VurderingInngang = ({
  bekreftOgFortsett,
  alleLandkoder,
  avklartefakta,
  redigerbart,
  oppdaterData,
  oppfyllerInngangsvilkar,
  slettData,
  inngangsvilkaar: {
    begrunnelseKoder: inngangsvilkaarBegrunnelser,
  },
  tilstand: {
    harAvklaring,
  },
  begrunnelser: {
    opphold: soknadslandBegrunnelser,
  },
}) => {
  useEffect(() => (
    function cleanup() {
      slettData();
    }
  ), []);

  return (
    <div className="vurderingInngang">
      <Nav.typo.Undertittel>Kontroller inngangsvilkår</Nav.typo.Undertittel>
      <Varsler oppfyllerInngangsvilkar={oppfyllerInngangsvilkar} inngangsvilkaarBegrunnelser={inngangsvilkaarBegrunnelser} />
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
  tilstand: PT.shape({
    harAvklaring: PT.bool.isRequired,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  inngangsvilkaar: MPT.Vilkaar.isRequired,
  oppfyllerInngangsvilkar: PT.bool.isRequired,
};

const mapStateToProps = state => ({
  initialValues: {
    soknadsland: behandlingsgrunnlagSelectors.SoknadslandSelector(state),
    fjernedeLand: avklartefaktaSelectors.IkkeGyldigeSoknadslandFaktaerSelector(state),
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
