import React, { useEffect } from 'react';
import * as MKV from 'melosys-kodeverk';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';

import * as KV from '../../../kodeverk';
import EnkeltAvklartfakta from './felles/enkeltAvklartfakta';
import { BoolskAvklartfaktaType, VurderingVesentligAktivitetINorgeTyper } from '../../../kodeverk/koder';
import { hentFaktaVerdi, konverterTilStegData, lagAvklartfakta } from '../../../regler/avklartefakta';
import { lagLovvalgsbestemmelse, slettLovvalgsbestemmelse } from '../../../regler/lovvalgsbestemmelser';

import './vurderingArbeidsmonster.css';

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
    const verdi = erMarginaltArbeidIArbeidsland ? BoolskAvklartfaktaType.USANN : BoolskAvklartfaktaType.SANN;
    oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.MARGINALT_ARBEID, landKode.kode, verdi));
  };

  return (
    <div className="land__enkeltlinje">
      <span>{`${landKode.term} (${landKode.kode})`}</span>
      <Nav.Checkbox
        disabled={!redigerbart}
        checked={erMarginaltArbeidIArbeidsland === true}
        value={BoolskAvklartfaktaType.SANN}
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
    arbeidsland, redigerbart, marginaltArbeid, landMedVesentligArbeid, erNorgeValgt, oppdaterData,
  } = props;


  const kombinasjonsbeskrivelse = erNorgeValgt ? 'kun Norge' : 'et land, ikke Norge (Fortsetter med Art.12)';
  const valgtKombinasjonInformasjon = landMedVesentligArbeid.length === 1 &&
    (
      <Nav.AlertStripeInfo>
        Valgt kombinasjon er { kombinasjonsbeskrivelse }
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
  landMedVesentligArbeid: PT.array.isRequired,
  erNorgeValgt: PT.bool.isRequired,
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
    bekreftOgFortsett, arbeidsland, tilstand, redigerbart, oppdaterData, slettData,
  } = props;
  const {
    arbeidsmonster, marginaltArbeid, aktivitetINorge,
    aktivitetINorgeNodvendig, harAvklaring,
  } = tilstand;


  const oppdaterLovvalgsperiode = avklartAktivitetINorge => {
    if (avklartAktivitetINorge === VurderingVesentligAktivitetINorgeTyper.OVER_25_PROSENT) {
      oppdaterData(lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART13_1A));
    } else {
      slettData(slettLovvalgsbestemmelse());
    }
  };

  useEffect(() => {
    const avklartAktivitetINorge = hentFaktaVerdi(aktivitetINorge);
    oppdaterLovvalgsperiode(avklartAktivitetINorge);
    return function cleanup() {
      slettData();
    };
  }, []);

  const skiftesvisSekvensieltValg = [
    { label: 'Skiftesvis eller med regelmessig veksling av arbeidsland', type: KV.Koder.VurderingSkiftesvisSekvensieltArbeid.SKIFTESVIS },
    { label: 'Sekvensielt, uten regelmessig skifte av arbeidsland', type: KV.Koder.VurderingSkiftesvisSekvensieltArbeid.SEKVENSIELT },
  ];

  const vesentligAktivitetINorgeValg = [
    { label: '25% eller mer', type: VurderingVesentligAktivitetINorgeTyper.OVER_25_PROSENT },
    { label: 'Mindre enn 25%', type: VurderingVesentligAktivitetINorgeTyper.UNDER_25_PROSENT },
  ];

  const visMarginaltArbeid = hentFaktaVerdi(arbeidsmonster) === KV.Koder.VurderingSkiftesvisSekvensieltArbeid.SKIFTESVIS;

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
          {...tilstand}
        />
        }
        { visMarginaltArbeid && aktivitetINorgeNodvendig &&
        <EnkeltAvklartfakta
          redigerbart={redigerbart}
          avklartfakta={aktivitetINorge}
          avklartfaktaKode={KV.Koder.avklartefaktaKoder.AKTIVITET_I_NORGE}
          avklartefaktaTyper={vesentligAktivitetINorgeValg}
          tittel="Vurdering av aktivitet i Norge"
          oppdaterData={oppdaterData}
          slettData={slettData}
          onChange={oppdaterLovvalgsperiode}
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
  slettData: PT.func.isRequired,
  arbeidsland: PT.array.isRequired,
  tilstand: PT.shape({
    harAvklaring: PT.bool,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
};

export default VurderingArbeidsmonster;
