import React, { Component, useEffect } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';

import './vurderingArbeidsmonster.css';
import { konverterTilStegData, lagAvklartfakta } from '../../../regler/avklartefakta';
import * as KV from '../../../kodeverk';
import EnkeltAvklartfakta from './felles/enkeltAvklartfakta';

const uuid = require('uuid/v4');

/**
 * Enkeltsjekkboks for marginalt arbeid i et land.
 *
 * @param props Objekt Diverse props (se propTypes)
 */
const LandLinje = props => {
  const {
    landKode, erValgt, klikkHandler, redigerbart,
  } = props;


  return (
    <div className="land__enkeltlinje">
      <span>{`${landKode.term} (${landKode.kode})`}</span>
      <Nav.Checkbox disabled={!redigerbart} checked={erValgt} onChange={() => klikkHandler(landKode.kode, erValgt)} label="ja" />
    </div>
  );
};

LandLinje.propTypes = {
  klikkHandler: PT.func.isRequired,
  landKode: MPT.Kodeverk.isRequired,
  erValgt: PT.bool,
  redigerbart: PT.bool.isRequired,
};

LandLinje.defaultProps = {
  erValgt: false,
};

/**
 * @param props Objekt Diverse props Se prop types
 */
class LandListe extends Component {
  landValgEndret = (orgnr, erValgt) => {
    const { oppdaterData } = this.props;
    const verdi = erValgt ? 'FALSE' : 'TRUE';
    oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.MARGINALT_ARBEID, orgnr, verdi));
  };

  render() {
    const { arbeidsland, redigerbart, marginaltArbeid } = this.props;

    const ingenArbeidslandVarsel = arbeidsland.length === 0 && (
      <Nav.AlertStripe type="advarsel">Finner ingen arbeidsland.</Nav.AlertStripe>
    );

    return (
      <Nav.Fieldset legend="Er det marginalt arbeid i noen av landene?">
        <div className="landliste_innhold">
          <div className="land__enkeltlinje">
            <Nav.UndertekstBold>Land</Nav.UndertekstBold>
            <Nav.UndertekstBold>Marginalt arbeid? <br /> {'(<5%)'}</Nav.UndertekstBold>
          </div>
          {arbeidsland.map(arbeidslandet => {
            const avklartMarginaltArbeidILand = marginaltArbeid.find(enkeltAvklaring => enkeltAvklaring.subjektID === arbeidslandet);
            const erMarginaltArbeidIArbeidsland = avklartMarginaltArbeidILand && avklartMarginaltArbeidILand.fakta.includes('TRUE');

            return <LandLinje
              landKode={arbeidslandet}
              erValgt={erMarginaltArbeidIArbeidsland}
              key={uuid()}
              klikkHandler={this.landValgEndret}
              redigerbart={redigerbart}
            />;
          })
          }
          {ingenArbeidslandVarsel}
        </div>
      </Nav.Fieldset>
    );
  }
}

LandListe.propTypes = {
  arbeidsland: PT.array,
  marginaltArbeid: PT.array,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
};

LandListe.defaultProps = {
  arbeidsland: [],
  marginaltArbeid: [],
};

/**
 * Dette er hovedkomponenten for fanen "Arbeidsmønster". Denne trekker inn LandListe som er utlistingen av sjekkbokser og håndtereren
 * av event handlers hvor bruker velger marginalt arbeid i land.
 *
 * @param props
 */
const VurderingArbeidsmonster = props => {
  const {
    bekreftOgFortsett, arbeidsland, tilstand, redigerbart, oppdaterData, slettAllDataForSteg,
  } = props;
  const { harAvklaring, marginaltArbeid, aktivitetINorge } = tilstand;

  useEffect(() => {
    marginaltArbeid.forEach(ma => {
      oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.MARGINALT_ARBEID, ma));
    });
    return function cleanup() {
      slettAllDataForSteg();
    };
  }, []);

  const avklartefaktaTyper = [
    { label: '25% eller mer', type: 'TRUE' },
    { label: 'Mindre enn 25%', type: 'FALSE' },
  ];

  return (
    <div className="vurderingArbeidsmonster">
      <Nav.Undertittel>Vurdering av arbeidsmønster</Nav.Undertittel>
      <div className="arbeidsmonster">
        <LandListe
          redigerbart={redigerbart}
          marginaltArbeid={marginaltArbeid}
          arbeidsland={arbeidsland}
          oppdaterData={oppdaterData}
        />
        <EnkeltAvklartfakta
          redigerbart={redigerbart}
          avklartfakta={aktivitetINorge}
          avklartfaktaKode={KV.Koder.avklartefaktaKoder.AKTIVITET_I_NORGE}
          avklartefaktaTyper={avklartefaktaTyper}
          tittel="Vurdering av aktivitet i Norge"
          oppdaterData={oppdaterData}
        />
        <div className="fane__knapplinje">
          <Nav.Knapp disabled={!(redigerbart && harAvklaring)} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </div>
    </div>
  );
};

VurderingArbeidsmonster.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  oppdaterData: PT.func.isRequired,
  slettAllDataForSteg: PT.func.isRequired,
  arbeidsland: PT.array.isRequired,
  tilstand: PT.shape({
    harAvklaring: PT.bool,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
};

export default VurderingArbeidsmonster;
