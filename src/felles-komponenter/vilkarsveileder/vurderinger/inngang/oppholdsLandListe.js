import React, { Component } from 'react';
import { connect } from 'react-redux';
import { formValueSelector, change } from 'redux-form';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';

import FjernetLandEnkelt from './fjernetLandEnkelt';
import OppholdsLandEnkelt from './oppholdsLandEnkelt';
import OppholdsLandHandlingLeggTil from './oppholdsLandHandlingLeggTil';

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

  finnLandVedKode = kode => (this.props.alleLandKoder.find(land => land.kode === kode));

  finnBegrunnelseVedKode = kode => {
    const begrunnelseObjekt = this.props.oppholdBegrunnelser.find(begrunnelse => begrunnelse.kode === kode);
    return begrunnelseObjekt ? begrunnelseObjekt.term : '';
  };

  render () {
    const { fields, oppholdBegrunnelser, alleLandKoder } = this.props;
    const {
      bekreftFjern, angreFjern, finnBegrunnelseVedKode, bekreftLeggTil, finnLandVedKode,
    } = this;

    const alleOppholdsland = fields.getAll();
    const alleGyldigeOppholdsland = alleOppholdsland.filter(opphold => opphold.erGyldig);
    const alleIkkeGyldigeOppholdsland = fields
      .getAll()
      .filter(opphold => !opphold.erGyldig);

    const alleUbrukteLandkoder = alleLandKoder.filter(land => !alleOppholdsland.map(ol => ol.landKode).includes(land.kode));

    return (
      <div>
        <div className="oppholdsland__liste">
          <Nav.Fieldset legend="Land:" >
            { alleGyldigeOppholdsland.map(opphold => (
              <OppholdsLandEnkelt
                key={opphold.landKode}
                landKodeObjekt={finnLandVedKode(opphold.landKode)}
                bekreftFjern={bekreftFjern}
                erGyldig={opphold.erGyldig}
                oppholdBegrunnelser={oppholdBegrunnelser} />))
            }
            <OppholdsLandHandlingLeggTil
              bekreftLeggTil={bekreftLeggTil}
              alleLandKoder={alleUbrukteLandkoder}
              oppholdBegrunnelser={oppholdBegrunnelser}
            />
          </Nav.Fieldset>
        </div>
        <div className="avvistland__liste">
          {alleIkkeGyldigeOppholdsland.length > 0 &&
          <Nav.Fieldset legend="Land som er fjernet fra behandlingen:">
            {alleIkkeGyldigeOppholdsland.map(opphold => (
              <FjernetLandEnkelt
                key={opphold.landKode}
                landKodeObjekt={this.finnLandVedKode(opphold.landKode)}
                begrunnelseTerm={finnBegrunnelseVedKode(opphold.begrunnelseKode)}
                angreFjern={angreFjern}
                erGyldig={opphold.erGyldig} />))
            }
          </Nav.Fieldset>
          }
        </div>
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
  alleLandKoder: PT.arrayOf(MPT.Kodeverk).isRequired,
};

const mapStateToProps = state => ({
  oppholdsLandFraSoknad: formValues(state, 'oppholdsland'),
});

const mapDispatchToProps = dispatch => ({
  erstattOppholdsLand: nyeOppholdsLand => dispatch(change('soknad', 'oppholdsland', nyeOppholdsLand)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OppholdsLandListe);
