import React, { Component } from 'react';
import { connect } from 'react-redux';
import { formValueSelector, change } from 'redux-form';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';

import OppholdsLandEnkelt from './oppholdsLandEnkelt';
import FjernetLandEnkelt from './fjernetLandEnkelt';
import OppholdsLandLeggTil from './oppholdsLandLeggTil';

import './oppholdsLandListe.css';

class OppholdsLandListe extends Component {
  bekreftFjern = (landKode, begrunnelseKode) => {
    // OK 1. Sjekk grunn til fjerning
    // OK 2. sett riktig flagg i faktaavklaring med begrunnelse.
    // OK 3. Ikke vis de som er fjernet for feil i søknaden.
    // 4. Hvis feil i journalføring, fjern også i soknad.
    // 5. Opprette ny
    const posisjon = this.props.fields.getAll().findIndex(opphold => opphold.landKode === landKode);
    const opphold = {
      ...this.props.fields.get(posisjon),
      erGyldig: false,
      begrunnelseKode,
    };


    this.props.fields.remove(posisjon);
    this.props.fields.push(opphold);

    if (begrunnelseKode === 'FEIL_LAND_JOURNALFORING') {
      this.fjernLandFraSoknad(landKode);
    }
  };

  bekreftLeggTil = landKode => {
    const opphold = {
      landKode,
      erGyldig: true,
      begrunnelsesKode: undefined,
    };

    this.props.fields.push(opphold);
    this.leggLandTilSoknad(landKode);
  };

  fjernLandFraSoknad = valgtLand => {
    const oppdaterteOppholdsLand = this.props.oppholdsLandFraSoknad.filter(land => land !== valgtLand);
    this.props.erstattOppholdsLand(oppdaterteOppholdsLand);
  };

  leggLandTilSoknad = valgtLand => {
    const oppdaterteOppholdsLand = [...this.props.oppholdsLandFraSoknad, valgtLand];
    this.props.erstattOppholdsLand(oppdaterteOppholdsLand);
  };

  angreFjern = landKode => {
    const posisjon = this.props.fields.getAll().findIndex(opphold => opphold.landKode === landKode);
    const opphold = {
      ...this.props.fields.get(posisjon),
      erGyldig: true,
      begrunnelseKode: undefined,
    };

    this.props.fields.remove(posisjon);
    this.props.fields.push(opphold);
  };

  finnLand = kode => (this.props.landkoder.find(land => land.kode === kode));

  finnBegrunnelse = kode => {
    const begrunnelseObjekt = this.props.oppholdBegrunnelser.find(begrunnelse => begrunnelse.kode === kode);
    return begrunnelseObjekt ? begrunnelseObjekt.term : '';
  };

  render () {
    const { fields, oppholdBegrunnelser, landkoder } = this.props;
    const {
      bekreftFjern, angreFjern, finnBegrunnelse, bekreftLeggTil,
    } = this;

    console.log(this.props.oppholdsLandFraSoknad);

    const alleGyldigeOppholdsland = fields.getAll().filter(opphold => opphold.erGyldig);
    const alleIkkeGyldigeOppholdsland = fields
      .getAll()
      .filter(opphold => !opphold.erGyldig && opphold.begrunnelseKode !== 'FEIL_LAND_JOURNALFORING');

    return (
      <div className="oppholdsland__liste">
        <Nav.Fieldset legend="Land:" >
          { alleGyldigeOppholdsland.map(opphold => (
            <OppholdsLandEnkelt
              key={opphold.landKode}
              landKodeObjekt={this.finnLand(opphold.landKode)}
              begrunnelseKode={opphold.begrunnelseKode}
              bekreftFjern={bekreftFjern}
              erGyldig={opphold.erGyldig}
              oppholdBegrunnelser={oppholdBegrunnelser} />))
          }
          <OppholdsLandLeggTil bekreftLeggTil={bekreftLeggTil} landkoder={landkoder} />
        </Nav.Fieldset>

        {alleIkkeGyldigeOppholdsland.length > 0 &&
        <Nav.Fieldset legend="Land som er fjernet fra søknaden:">
          {alleIkkeGyldigeOppholdsland.map(opphold => (
            <FjernetLandEnkelt
              key={opphold.landKode}
              landKodeObjekt={this.finnLand(opphold.landKode)}
              begrunnelseTerm={finnBegrunnelse(opphold.begrunnelseKode)}
              angreFjern={angreFjern}
              erGyldig={opphold.erGyldig} />))
          }
        </Nav.Fieldset>
        }
      </div>
    );
  }
}

const formValues = formValueSelector('soknad');

OppholdsLandListe.propTypes = {
  fields: PT.object.isRequired,
  oppholdBegrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  oppholdsLandFraSoknad: PT.arrayOf(PT.string).isRequired,
  erstattOppholdsLand: PT.func.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
};

const mapStateToProps = state => ({
  oppholdsLandFraSoknad: formValues(state, 'oppholdsland'),
});

const mapDispatchToProps = dispatch => ({
  erstattOppholdsLand: nyeOppholdsLand => dispatch(change('soknad', 'oppholdsland', nyeOppholdsLand)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OppholdsLandListe);
