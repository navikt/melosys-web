import React, { Component } from 'react';
import { connect } from 'react-redux';
import { formValueSelector, change } from 'redux-form';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';
import * as KV from '../../../../kodeverk';

import FjernetLandEnkelt from './fjernetLandEnkelt';
import SoknadslandEnkelt from './soknadslandEnkelt';
import SoknadslandHandlingLeggTil from './soknadslandHandlingLeggTil';

import { konverterTilStegData, lagAvklartfakta } from '../../../../regler/avklartefakta';
import * as avklartefaktaSelectors from '../../../../ducks/avklartefakta/selectors';

import './soknadslandListe.css';

class SoknadslandListe extends Component {
  componentDidMount() {
    const { avklarteSoknadsland, oppdaterData } = this.props;
    avklarteSoknadsland.forEach(soknadsland => {
      oppdaterData(konverterTilStegData(KV.Koder.SOKNADSLAND, soknadsland));
    });
  }

  bekreftFjern = (landkode, begrunnelseKode) => {
    const avklartefakta = this.props.fields.getAll();
    const enkeltFakta = avklartefakta.find(enkelt => enkelt.subjektID === landkode);
    const oppdatertEnkeltFakta = {
      ...enkeltFakta,
      fakta: ['FALSE'],
      begrunnelseKoder: [begrunnelseKode],
    };
    const posisjon = avklartefakta.findIndex(avklart => avklart.subjektID === landkode);
    this.props.fields.remove(posisjon);
    this.props.fields.push(oppdatertEnkeltFakta);

    if (begrunnelseKode === MKV.Koder.begrunnelser.opphold.FEIL_LAND_JOURNALFOERING
     || begrunnelseKode === MKV.Koder.begrunnelser.opphold.NYE_OPPLYSNINGER_LAND) {
      this.fjernLandFraSoknad(landkode);
    }
    this.props.oppdaterData(lagAvklartfakta(KV.Koder.SOKNADSLAND, landkode, 'FALSE', begrunnelseKode));
  };

  bekreftLeggTil = (landkode, begrunnelseKode) => {
    const avklartFakta = {
      referanse: KV.Koder.SOKNADSLAND,
      avklartefaktaKode: null,
      fakta: ['TRUE'],
      subjektID: landkode,
      begrunnelseKoder: [begrunnelseKode],
      begrunnelseFritekst: null,
    };

    this.props.fields.push(avklartFakta);
    this.leggLandTilSoknad(landkode);
    this.props.oppdaterData(lagAvklartfakta(KV.Koder.SOKNADSLAND, landkode, 'TRUE', begrunnelseKode));
  };

  fjernLandFraSoknad = valgtLand => {
    const oppdaterteSoknadsland = this.props.soknadslandFraSoknad.filter(land => land !== valgtLand);
    this.props.erstattSoknadsland(oppdaterteSoknadsland);
  };

  leggLandTilSoknad = valgtLand => {
    const oppdaterteSoknadsland = [...this.props.soknadslandFraSoknad, valgtLand];
    this.props.erstattSoknadsland(oppdaterteSoknadsland);
  };

  angreFjern = landkode => {
    const avklartefakta = this.props.fields.getAll();
    const enkeltFakta = avklartefakta.find(enkelt => enkelt.subjektID === landkode);
    const oppdatertEnkeltFakta = {
      ...enkeltFakta,
      fakta: ['TRUE'],
      begrunnelseKoder: [],
    };
    const posisjon = avklartefakta.findIndex(avklart => avklart.subjektID === landkode);
    this.props.fields.remove(posisjon);
    this.props.fields.push(oppdatertEnkeltFakta);

    if (enkeltFakta.begrunnelseKoder.includes(MKV.Koder.begrunnelser.opphold.FEIL_LAND_JOURNALFOERING)
        || enkeltFakta.begrunnelseKoder.includes(MKV.Koder.begrunnelser.opphold.NYE_OPPLYSNINGER_LAND)) {
      this.leggLandTilSoknad(landkode);
    }
  };

  finnLandVedKode = kode => (this.props.alleLandkoder.find(land => land.kode === kode));

  finnBegrunnelse = koder => {
    const enkeltKode = koder[0];
    const begrunnelseObjekt = this.props.soknadslandBegrunnelser.find(begrunnelse => begrunnelse.kode === enkeltKode);
    return begrunnelseObjekt ? begrunnelseObjekt.term : '';
  };

  render () {
    const {
      fields, soknadslandBegrunnelser, alleLandkoder, soknadslandFraSoknad, redigerbart,
    } = this.props;

    const {
      bekreftFjern, angreFjern, finnBegrunnelse, bekreftLeggTil, finnLandVedKode,
    } = this;

    const alleAvklarteFakta = fields.getAll() || [];

    const alleGyldigeSoknadsland = alleAvklarteFakta.filter(avklartFakta => avklartFakta.fakta.includes('TRUE'));
    const alleIkkeGyldigeSoknadsland = alleAvklarteFakta.filter(avklartFakta => avklartFakta.fakta.includes('FALSE'));

    const alleUbrukteLandkoder = alleLandkoder.filter(landkode => !soknadslandFraSoknad.includes(landkode.kode));

    return (
      <div>
        <div className="soknadsland__liste">
          <Nav.Fieldset legend="Land:" >
            { alleGyldigeSoknadsland.map(soknadslandFakta => (
              <SoknadslandEnkelt
                key={soknadslandFakta.subjektID}
                landkodeObjekt={finnLandVedKode(soknadslandFakta.subjektID)}
                bekreftFjern={bekreftFjern}
                erGyldig={soknadslandFakta.erGyldig}
                soknadslandBegrunnelser={soknadslandBegrunnelser}
                redigerbart={redigerbart} />))
            }
            {
              alleGyldigeSoknadsland.length === 0 && (
                <div className="soknadsland__liste__varsel">
                  <Nav.AlertStripe type="advarsel">Det er ikke lagt til noen gyldige søknadsland!</Nav.AlertStripe>
                </div>
              )
            }
            <SoknadslandHandlingLeggTil
              bekreftLeggTil={bekreftLeggTil}
              alleLandkoder={alleUbrukteLandkoder}
              soknadslandBegrunnelser={soknadslandBegrunnelser}
              redigerbart={redigerbart}
            />
          </Nav.Fieldset>
        </div>
        <div className="avvistland__liste">
          {alleIkkeGyldigeSoknadsland.length > 0 &&
          <Nav.Fieldset legend="Land som er fjernet fra behandlingen:">
            {alleIkkeGyldigeSoknadsland.map(soknadslandFakta => (
              <FjernetLandEnkelt
                key={soknadslandFakta.subjektID}
                landkodeObjekt={finnLandVedKode(soknadslandFakta.subjektID)}
                begrunnelseTerm={finnBegrunnelse(soknadslandFakta.begrunnelseKoder)}
                angreFjern={angreFjern}
                erGyldig={soknadslandFakta.erGyldig}
                redigerbart={redigerbart} />))
            }
          </Nav.Fieldset>
          }
        </div>
      </div>
    );
  }
}

const formValues = formValueSelector('soknad');

SoknadslandListe.propTypes = {
  fields: PT.object.isRequired,
  soknadslandBegrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  soknadslandFraSoknad: PT.arrayOf(PT.string).isRequired,
  erstattSoknadsland: PT.func.isRequired,
  alleLandkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  avklartefakta: MPT.Avklartefakta.isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  avklarteSoknadsland: PT.array.isRequired,
};

const mapStateToProps = state => ({
  soknadslandFraSoknad: formValues(state, 'soknadsland'),
  avklarteSoknadsland: avklartefaktaSelectors.Soknadsland(state),

});

const mapDispatchToProps = dispatch => ({
  erstattSoknadsland: nyttSoknadsland => dispatch(change('soknad', 'soknadsland', nyttSoknadsland)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SoknadslandListe);
