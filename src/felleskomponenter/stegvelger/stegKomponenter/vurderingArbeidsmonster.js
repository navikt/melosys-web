import React, { useEffect } from 'react';
import PT from 'prop-types';

import MKV from '../../../melosyskodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import * as KV from '../../../kodeverk';

import EnkeltAvklartfakta from './felles/enkeltAvklartfakta';
import { BoolskAvklartfaktaType, VurderingVesentligAktivitetINorgeTyper } from '../../../kodeverk/koder';
import { hentFaktaVerdi, konverterTilStegData, lagAvklartfakta } from '../../../regler/avklartefakta';
import { lagLovvalgsbestemmelse, slettLovvalgsbestemmelse, konverterLovvalgsbestemmelseTilStegData } from '../../../regler/lovvalgsbestemmelser';

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
      oppdaterData(konverterTilStegData(MKV.Koder.avklartefaktatyper.MARGINALT_ARBEID, avklartMarginaltArbeidILand));
    }
  }, []);

  const erMarginaltArbeidIArbeidsland = avklartMarginaltArbeidILand && avklartMarginaltArbeidILand.fakta.includes('TRUE');

  const klikkHandler = () => {
    const verdi = erMarginaltArbeidIArbeidsland ? BoolskAvklartfaktaType.USANN : BoolskAvklartfaktaType.SANN;
    oppdaterData(lagAvklartfakta(MKV.Koder.avklartefaktatyper.MARGINALT_ARBEID, landKode.kode, verdi));
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
        className="marginaltArbeidCheckbox"
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


  const kombinasjonsbeskrivelse = erNorgeValgt ? 'kun Norge' : 'ett land, ikke Norge (Fortsetter med Art.12)';
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
            <Nav.typo.UndertekstBold>Land</Nav.typo.UndertekstBold>
            <Nav.typo.UndertekstBold className="marginaltArbeidCheckbox">Marginalt arbeid? {'(<5%)'}</Nav.typo.UndertekstBold>
          </div>
          {arbeidsland.map(({ land }) => {
            const avklartMarginaltArbeidILand = marginaltArbeid.find(enkeltAvklaring => enkeltAvklaring.subjektID === land.kode);

            const key = `marginaltArbeidslandListe${land.kode}`;
            return <LandLinje
              landKode={land}
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
  arbeidsland: PT.arrayOf(MPT.ArbeidslandMedYrkesaktivitet),
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
export const VurderingArbeidsmonster = ({
  bekreftOgFortsett,
  arbeidsland,
  tilstand,
  redigerbart,
  oppdaterData,
  slettData,
}) => {
  const {
    marginaltArbeid,
    aktivitetINorge,
    aktivitetINorgeNodvendig,
    erYrkesaktivitetAntallLandNodvendig,
    erYrkesAktivitetOffentligNodvendig,
    harAvklaring,
    yrkesaktivitet,
    loennetArbeidAntallLandFakta,
    offentligArbeidAntallLandFakta,
  } = tilstand;

  const loennetArbeidEndretHandler = avklartLoennetArbeid => {
    if (avklartLoennetArbeid === KV.Koder.LoennetArbeidAntallLand.NORGE) {
      oppdaterData(lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_3));
    } else if (avklartLoennetArbeid === KV.Koder.LoennetArbeidAntallLand.FLERE_LAND) {
      slettData(slettLovvalgsbestemmelse());
    }
  };

  const offentligArbeidEndretHandler = avklartOffentligArbeid => {
    if (avklartOffentligArbeid === KV.Koder.OffentligArbeidAntallLand.NORGE_OG_ANNEN_VIRKSOMHET ||
      avklartOffentligArbeid === KV.Koder.OffentligArbeidAntallLand.ANNET_LAND_OG_ANNEN_VIRKSOMHET) {
      oppdaterData(lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_4));
    }
  };

  const aktivitetINorgeEndretHandler = avklartAktivitetINorge => {
    if (avklartAktivitetINorge === VurderingVesentligAktivitetINorgeTyper.OVER_25_PROSENT) {
      if (yrkesaktivitet === KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_OG_SELVSTENDIG) {
        oppdaterData(lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_3));
      } else {
        oppdaterData(lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1A));
      }
    } else if (avklartAktivitetINorge === VurderingVesentligAktivitetINorgeTyper.UNDER_25_PROSENT) {
      if (yrkesaktivitet === KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE) {
        oppdaterData(lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_2B));
      } else {
        slettData(slettLovvalgsbestemmelse());
      }
    }
  };

  const oppdaterLovvalgsperiodeVedMount = avklartAktivitetINorge => {
    if (avklartAktivitetINorge === VurderingVesentligAktivitetINorgeTyper.OVER_25_PROSENT) {
      oppdaterData(konverterLovvalgsbestemmelseTilStegData(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1A));
    } else if (avklartAktivitetINorge === VurderingVesentligAktivitetINorgeTyper.UNDER_25_PROSENT) {
      if (yrkesaktivitet === KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE) {
        oppdaterData(konverterLovvalgsbestemmelseTilStegData(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_2B));
      }
    }
  };

  useEffect(() => {
    const avklartAktivitetINorge = hentFaktaVerdi(aktivitetINorge);
    oppdaterLovvalgsperiodeVedMount(avklartAktivitetINorge);

    return () => {
      slettData();
    };
  }, []);

  const vesentligAktivitetINorgeValg = [
    { label: '25% eller mer', type: VurderingVesentligAktivitetINorgeTyper.OVER_25_PROSENT },
    { label: 'Mindre enn 25%', type: VurderingVesentligAktivitetINorgeTyper.UNDER_25_PROSENT },
  ];

  const loennetArbeidValg = [
    {
      label: 'Lønnet arbeid i Norge og selvstendig virksomhet (13.3)',
      type: KV.Koder.LoennetArbeidAntallLand.NORGE,
    },
    {
      label: 'Lønnet arbeid i et annet land og selvstendig virksomhet (13.3)',
      type: KV.Koder.LoennetArbeidAntallLand.ETT_ANNET_LAND,
    },
    {
      label: 'Lønnet arbeid i to eller flere land og selvstendig virksomhet (13.1)',
      type: KV.Koder.LoennetArbeidAntallLand.FLERE_LAND,
    },
  ];

  const offentligArbeidValg = [
    {
      label: 'Offentlig tjeneste i Norge og annen virksomhet (13.4)',
      type: KV.Koder.OffentligArbeidAntallLand.NORGE_OG_ANNEN_VIRKSOMHET,
    },
    {
      label: 'Offentlig tjeneste i et annet land og annen virksomhet (13.4)',
      type: KV.Koder.OffentligArbeidAntallLand.ANNET_LAND_OG_ANNEN_VIRKSOMHET,
    },
    {
      label: 'Offentlig tjeneste i to eller flere land og annen virksomhet (13.1)',
      type: KV.Koder.OffentligArbeidAntallLand.FLERE_LAND_OG_ANNEN_VIRKSOMHET,
    },
  ];

  return (
    <div className="vurderingArbeidsmonster">
      <Nav.typo.Undertittel>Vurder aktiviteten i de ulike landene</Nav.typo.Undertittel>
      <div className="arbeidsmonster">
        <MarginaltArbeid
          redigerbart={redigerbart}
          marginaltArbeid={marginaltArbeid}
          arbeidsland={arbeidsland}
          oppdaterData={oppdaterData}
          {...tilstand}
        />
        {
          erYrkesaktivitetAntallLandNodvendig &&
          <EnkeltAvklartfakta
            redigerbart={redigerbart}
            avklartfakta={loennetArbeidAntallLandFakta}
            avklartfaktaKode={KV.Koder.avklartefaktaKoder.LOENNET_ARBEID_ANTALL_LAND}
            avklartefaktaTyper={loennetArbeidValg}
            tittel="Vurder aktivitet"
            oppdaterData={oppdaterData}
            slettData={slettData}
            onChange={loennetArbeidEndretHandler}
          />
        }
        {
          erYrkesAktivitetOffentligNodvendig &&
          <EnkeltAvklartfakta
            redigerbart={redigerbart}
            avklartfakta={offentligArbeidAntallLandFakta}
            avklartfaktaKode={KV.Koder.avklartefaktaKoder.OFFENTLIG_ARBEID_ANTALL_LAND}
            avklartefaktaTyper={offentligArbeidValg}
            tittel="Vurder aktivitet"
            oppdaterData={oppdaterData}
            slettData={slettData}
            onChange={offentligArbeidEndretHandler}
          />
        }
        {
          aktivitetINorgeNodvendig &&
          <EnkeltAvklartfakta
            redigerbart={redigerbart}
            avklartfakta={aktivitetINorge}
            avklartfaktaKode={KV.Koder.avklartefaktaKoder.AKTIVITET_I_NORGE}
            avklartefaktaTyper={vesentligAktivitetINorgeValg}
            tittel="Vurdering av vesentlig aktivitet i Norge"
            oppdaterData={oppdaterData}
            slettData={slettData}
            onChange={aktivitetINorgeEndretHandler}
          />
        }
        <div className="fane__knapplinje">
          <Nav.Knapp disabled={!(redigerbart && harAvklaring)} className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </div>
    </div>
  );
};

VurderingArbeidsmonster.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  arbeidsland: PT.arrayOf(MPT.ArbeidslandMedYrkesaktivitet).isRequired,
  tilstand: PT.shape({
    marginaltArbeid: PT.array,
    aktivitetINorge: PT.object,
    aktivitetINorgeNodvendig: PT.bool,
    harAvklaring: PT.bool,
    yrkesaktivitet: PT.string.isRequired,
    erYrkesaktivitetAntallLandNodvendig: PT.bool.isRequired,
    erYrkesAktivitetOffentligNodvendig: PT.bool.isRequired,
    loennetArbeidAntallLandFakta: MPT.Avklartefakta,
    offentligArbeidAntallLandFakta: MPT.Avklartefakta,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
};

export default VurderingArbeidsmonster;
