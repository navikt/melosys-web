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

  bekreftLeggTil = (landKode, begrunnelseKode) => {
    const opphold = {
      landKode,
      erGyldig: true,
      begrunnelseKode,
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

    const alleOppholdsland = fields.getAll();
    const alleGyldigeOppholdsland = alleOppholdsland.filter(opphold => opphold.erGyldig);
    const alleIkkeGyldigeOppholdsland = fields
      .getAll()
      .filter(opphold => !opphold.erGyldig && opphold.begrunnelseKode !== 'FEIL_LAND_JOURNALFORING');

    const alleUbrukteLandkoder = landkoder.filter(land => !alleOppholdsland.map(ol => ol.landKode).includes(land.kode));

    return (
      <Nav.Container fluid className="oppholdsland__liste">
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
          <OppholdsLandLeggTil
            bekreftLeggTil={bekreftLeggTil}
            landkoder={alleUbrukteLandkoder}
            oppholdBegrunnelser={oppholdBegrunnelser}
          />
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
      </Nav.Container>
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
