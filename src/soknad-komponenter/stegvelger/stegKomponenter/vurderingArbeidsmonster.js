import * as MKV from 'melosys-kodeverk';
import React, { useEffect } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';

import './vurderingArbeidsmonster.css';
import { hentFaktaVerdi, konverterTilStegData, lagAvklartfakta } from '../../../regler/avklartefakta';
import * as KV from '../../../kodeverk';
import EnkeltAvklartfakta from './felles/enkeltAvklartfakta';

/**
 * Enkeltsjekkboks for marginalt arbeid i et land.
 *
 * @param props Objekt Diverse props (se propTypes)
 */
const LandLinje = props => {
  const {
    landKode, avklartMarginaltArbeidILand, oppdaterData, redigerbart,
  } = props;

  useEffect(() => {
    if (avklartMarginaltArbeidILand) {
      oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.MARGINALT_ARBEID, avklartMarginaltArbeidILand));
    }
  }, []);

  const erMarginaltArbeidIArbeidsland = avklartMarginaltArbeidILand && avklartMarginaltArbeidILand.fakta.includes('TRUE');

  const klikkHandler = () => {
    const verdi = erMarginaltArbeidIArbeidsland ? 'FALSE' : 'TRUE';
    oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.MARGINALT_ARBEID, landKode.kode, verdi));
  };

  return (
    <div className="land__enkeltlinje">
      <span>{`${landKode.term} (${landKode.kode})`}</span>
      <Nav.Checkbox
        disabled={!redigerbart}
        checked={erMarginaltArbeidIArbeidsland === true}
        value="TRUE"
        onChange={klikkHandler}
        label="ja"
      />
    </div>
  );
};

LandLinje.propTypes = {
  oppdaterData: PT.func.isRequired,
  landKode: MPT.Kodeverk.isRequired,
  avklartMarginaltArbeidILand: PT.object,
  redigerbart: PT.bool.isRequired,
};

LandLinje.defaultProps = {
  avklartMarginaltArbeidILand: undefined,
};

/**
 * @param props Objekt Diverse props Se prop types
 */
const MarginaltArbeid = props => {
  const {
    arbeidsland, redigerbart, marginaltArbeid, oppdaterData,
  } = props;

  const hentLandMedVesentligArbeid = () => {
    const erArbeidMarginaltILand = landkode => (
      marginaltArbeid.some(ma => (
        ma.subjektID === landkode &&
        hentFaktaVerdi(ma) === 'TRUE'
      ))
    );
    return arbeidsland.map(al => al.kode)
      .filter(kode => !erArbeidMarginaltILand(kode));
  };

  const hentKombinasjonsbeskrivelse = land => {
    const erNorgeValgt = land.includes(MKV.Koder.landkoder.NO);
    const erFlereLand = land.length > 1;

    if (erFlereLand) {
      let flereLandBeskrivelse = 'flere land, ';
      if (erNorgeValgt) {
        flereLandBeskrivelse += 'hvorav et er Norge';
      } else {
        flereLandBeskrivelse += 'ikke Norge';
      }
      return flereLandBeskrivelse;
    }

    return erNorgeValgt ? 'kun Norge' : 'et land, ikke Norge (Art.12)';
  };

  const landMedVesentligArbeid = hentLandMedVesentligArbeid();
  const valgtKombinasjonInformasjon = landMedVesentligArbeid.length === 1 &&
    (
      <Nav.AlertStripeInfo>
        Valgt kombinasjon er { hentKombinasjonsbeskrivelse(landMedVesentligArbeid) }
      </Nav.AlertStripeInfo>
    );

  const ingenArbeidslandVarsel = landMedVesentligArbeid.length === 0 && (
    <Nav.AlertStripe type="advarsel">Finner ingen arbeidsland, eller ingen land med vesentlig virksomhet.</Nav.AlertStripe>
  );

  return (
    <Nav.Fieldset legend="Er det marginalt arbeid i noen av landene?">
      <div className="marginaltArbeid">
        <div className="landliste_innhold">
          <div className="land__enkeltlinje">
            <Nav.UndertekstBold>Land</Nav.UndertekstBold>
            <Nav.UndertekstBold>Marginalt arbeid? <br /> {'(<5%)'}</Nav.UndertekstBold>
          </div>
          {arbeidsland.map(arbeidslandet => {
            const avklartMarginaltArbeidILand = marginaltArbeid.find(enkeltAvklaring => enkeltAvklaring.subjektID === arbeidslandet.kode);

            const key = `marginaltArbeidslandListe${arbeidslandet.kode}`;
            return <LandLinje
              landKode={arbeidslandet}
              avklartMarginaltArbeidILand={avklartMarginaltArbeidILand}
              key={key}
              oppdaterData={oppdaterData}
              redigerbart={redigerbart}
            />;
          })
          }
        </div>
        {ingenArbeidslandVarsel}
        {valgtKombinasjonInformasjon}
      </div>
    </Nav.Fieldset>
  );
};

MarginaltArbeid.propTypes = {
  arbeidsland: PT.array,
  marginaltArbeid: PT.array,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
};

MarginaltArbeid.defaultProps = {
  arbeidsland: [],
  marginaltArbeid: [],
};

/**
 * Dette er hovedkomponenten for fanen "Arbeidsmønster". Denne trekker inn MarginaltArbeid som er utlistingen av sjekkbokser og håndtereren
 * av event handlers hvor bruker velger marginalt arbeid i land.
 *
 * @param props
 */
const VurderingArbeidsmonster = props => {
  const {
    bekreftOgFortsett, arbeidsland, tilstand, redigerbart, oppdaterData, slettAllDataForSteg,
  } = props;
  const {
    harAvklaring, arbeidsmonster, marginaltArbeid, aktivitetINorge,
  } = tilstand;

  useEffect(() => (
    function cleanup() {
      slettAllDataForSteg();
    }
  ), []);

  const skiftesvisSekvensieltValg = [
    { label: 'Skiftesvis eller med regelmessig veksling av arbeidsland', type: KV.Koder.VurderingSkiftesvisSekvensieltArrbeid.SKIFTESVIS },
    { label: 'Sekvensielt, uten regelmessig skifte av arbeidsland', type: KV.Koder.VurderingSkiftesvisSekvensieltArrbeid.SEKVENSIELT },
  ];

  const vesentligAktivitetINorgeValg = [
    { label: '25% eller mer', type: 'TRUE' },
    { label: 'Mindre enn 25%', type: 'FALSE' },
  ];

  const visMarginaltArbeid = hentFaktaVerdi(arbeidsmonster) === KV.Koder.VurderingSkiftesvisSekvensieltArrbeid.SKIFTESVIS;
  const visAktivitetINorge = visMarginaltArbeid;

  return (
    <div className="vurderingArbeidsmonster">
      <Nav.Undertittel>Vurdering av arbeidsmønster</Nav.Undertittel>
      <div className="arbeidsmonster">
        <EnkeltAvklartfakta
          redigerbart={redigerbart}
          avklartfakta={arbeidsmonster}
          avklartfaktaKode={KV.Koder.avklartefaktaKoder.ARBEIDSMONSTER}
          avklartefaktaTyper={skiftesvisSekvensieltValg}
          tittel="Hvordan utføres arbeidet?"
          oppdaterData={oppdaterData}
        />
        { visMarginaltArbeid &&
        <MarginaltArbeid
          redigerbart={redigerbart}
          marginaltArbeid={marginaltArbeid}
          arbeidsland={arbeidsland}
          oppdaterData={oppdaterData}
        />
        }
        { visAktivitetINorge &&
        <EnkeltAvklartfakta
          redigerbart={redigerbart}
          avklartfakta={aktivitetINorge}
          avklartfaktaKode={KV.Koder.avklartefaktaKoder.AKTIVITET_I_NORGE}
          avklartefaktaTyper={vesentligAktivitetINorgeValg}
          tittel="Vurdering av aktivitet i Norge"
          oppdaterData={oppdaterData}
        />
        }
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
