import React, { Component } from 'react';
import { connect } from 'react-redux';
import { formValueSelector, change } from 'redux-form';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';
import * as Koder from '../../../../koder';

import FjernetLandEnkelt from './fjernetLandEnkelt';
import OppholdsLandEnkelt from './oppholdsLandEnkelt';
import OppholdsLandHandlingLeggTil from './oppholdsLandHandlingLeggTil';

import './oppholdsLandListe.css';

class OppholdsLandListe extends Component {
  bekreftFjern = (landKode, begrunnelseKode) => {
    const avklartefakta = this.props.fields.getAll();
    const enkeltFakta = avklartefakta.find(enkelt => enkelt.subjektID === landKode);
    const oppdatertEnkeltFakta = {
      ...enkeltFakta,
      fakta: ['FALSE'],
      begrunnelseKoder: [begrunnelseKode],
    };
    const posisjon = avklartefakta.findIndex(avklart => avklart.subjektID === landKode);
    this.props.fields.remove(posisjon);
    this.props.fields.push(oppdatertEnkeltFakta);

    if (begrunnelseKode === Koder.FEIL_LAND_JOURNALFOERING) {
      this.fjernLandFraSoknad(landKode);
    }
  };

  bekreftLeggTil = (landKode, begrunnelseKode) => {
    const avklartFakta = {
      referanse: Koder.OPPHOLDSLAND,
      avklartefaktaKode: null,
      fakta: ['TRUE'],
      subjektID: landKode,
      begrunnelseKoder: [begrunnelseKode],
      begrunnelseFritekst: null,
    };

    this.props.fields.push(avklartFakta);
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
    const avklartefakta = this.props.fields.getAll();
    const enkeltFakta = avklartefakta.find(enkelt => enkelt.subjektID === landKode);
    const oppdatertEnkeltFakta = {
      ...enkeltFakta,
      fakta: ['TRUE'],
      begrunnelseKoder: [],
    };
    const posisjon = avklartefakta.findIndex(avklart => avklart.subjektID === landKode);
    this.props.fields.remove(posisjon);
    this.props.fields.push(oppdatertEnkeltFakta);

    if (enkeltFakta.begrunnelseKoder.includes(Koder.FEIL_LAND_JOURNALFOERING)) {
      this.leggLandTilSoknad(landKode);
    }
  };

  finnLandVedKode = kode => (this.props.alleLandKoder.find(land => land.kode === kode));

  finnBegrunnelse = koder => {
    const enkeltKode = koder[0];
    const begrunnelseObjekt = this.props.oppholdBegrunnelser.find(begrunnelse => begrunnelse.kode === enkeltKode);
    return begrunnelseObjekt ? begrunnelseObjekt.term : '';
  };

  render () {
    const {
      fields, oppholdBegrunnelser, alleLandKoder, oppholdsLandFraSoknad,
    } = this.props;

    const {
      bekreftFjern, angreFjern, finnBegrunnelse, bekreftLeggTil, finnLandVedKode,
    } = this;

    const alleAvklarteFakta = fields.getAll() || [];

    const alleGyldigeOppholdsland = alleAvklarteFakta.filter(avklartFakta => avklartFakta.fakta.includes('TRUE'));
    const alleIkkeGyldigeOppholdsland = alleAvklarteFakta.filter(avklartFakta => avklartFakta.fakta.includes('FALSE'));

    const alleUbrukteLandkoder = alleLandKoder.filter(landKode => !oppholdsLandFraSoknad.includes(landKode.kode));

    return (
      <div>
        <div className="oppholdsland__liste">
          <Nav.Fieldset legend="Land:" >
            { alleGyldigeOppholdsland.map(opphold => (
              <OppholdsLandEnkelt
                key={opphold.subjektID}
                landKodeObjekt={finnLandVedKode(opphold.subjektID)}
                bekreftFjern={bekreftFjern}
                erGyldig={opphold.erGyldig}
                oppholdBegrunnelser={oppholdBegrunnelser} />))
            }
            {
              alleGyldigeOppholdsland.length === 0 && (
                <div className="oppholdsland__liste__varsel">
                  <Nav.AlertStripe type="advarsel">Det er ikke lagt til noen gyldige oppholdsland!</Nav.AlertStripe>
                </div>
              )
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
                key={opphold.subjektID}
                landKodeObjekt={this.finnLandVedKode(opphold.subjektID)}
                begrunnelseTerm={finnBegrunnelse(opphold.begrunnelseKoder)}
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
  avklartefakta: PT.array.isRequired,
};

const mapStateToProps = state => ({
  oppholdsLandFraSoknad: formValues(state, 'oppholdsland'),
});

const mapDispatchToProps = dispatch => ({
  erstattOppholdsLand: nyeOppholdsLand => dispatch(change('soknad', 'oppholdsland', nyeOppholdsLand)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OppholdsLandListe);
