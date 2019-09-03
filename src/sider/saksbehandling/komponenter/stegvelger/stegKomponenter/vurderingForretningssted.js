import React, { useEffect } from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';
import * as Nav from '../../../../../utils/navFrontend';
import * as KV from '../../../../../kodeverk';

import {
  hentFaktaVerdi,
  lagAvklartfakta,
  konverterTilStegData,
  slettAvklartfakta,
} from '../../../../../regler/avklartefakta';
import EnkeltLandPure from '../../../../../felleskomponenter/skjema/landvelger/enkeltLandPure';
import EnkeltAvklartfakta from './felles/enkeltAvklartfakta';

import './vurderingForretningssted.css';
import {
  finnLovvalgsbestemmelse,
  konverterLovvalgsbestemmelseTilStegData,
  lagLovvalgsbestemmelse,
} from '../../../../../regler/lovvalgsbestemmelser';

const Forretningsstedet = props => {
  const {
    forretningsstedet, avklartForretningsland, oppdaterData, slettData,
  } = props;
  if (!forretningsstedet) return null;

  useEffect(() => {
    if (avklartForretningsland) {
      oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.ARBEIDSGIVERS_FORRETNINGSSTED, avklartForretningsland));
    }
    return function cleanup() {
      slettData(slettAvklartfakta(KV.Koder.avklartefaktaKoder.ARBEIDSGIVERS_FORRETNINGSSTED));
    };
  }, []);

  const { navn, orgnr } = forretningsstedet;
  const landEndretHandler = e => {
    oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.ARBEIDSGIVERS_FORRETNINGSSTED, orgnr, e));
  };

  const eksisterendeLand = hentFaktaVerdi(avklartForretningsland) || '';

  return (
    <Nav.Fieldset legend={navn} className="forretningssted">
      <EnkeltLandPure
        label="Har forretningssted i"
        onChange={landEndretHandler}
        value={eksisterendeLand}
        landkoder={MKV.KTObjects.landkoder}
        multiland={false}
      />
    </Nav.Fieldset>
  );
};

Forretningsstedet.propTypes = {
  forretningsstedet: PT.object.isRequired,
  avklartForretningsland: PT.object,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
};

Forretningsstedet.defaultProps = {
  avklartForretningsland: null,
};


const Forretningssteder = props => {
  const { valgteVirksomheter, avklarteForretningsland } = props;

  const ingenValgteVirksomheterVarsel = valgteVirksomheter.length === 0 && (
    <Nav.AlertStripe type="advarsel">Finner ingen valgte virksomheter.</Nav.AlertStripe>
  );

  return (
    <div>
      {
        valgteVirksomheter.map(valgtVirksomhet => {
          const key = `forretningssted${valgtVirksomhet.orgnr}-${valgtVirksomhet.navn}`;
          const avklartForretningsland = avklarteForretningsland.find(enkeltAvklaring => enkeltAvklaring.subjektID === valgtVirksomhet.orgnr);

          return <Forretningsstedet
            key={key}
            forretningsstedet={valgtVirksomhet}
            avklartForretningsland={avklartForretningsland}
            oppdaterData={props.oppdaterData}
            slettData={props.slettData}
          />;
        })
      }
      {ingenValgteVirksomheterVarsel}
    </div>
  );
};

Forretningssteder.propTypes = {
  valgteVirksomheter: PT.array.isRequired,
  avklarteForretningsland: PT.array.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
};

const VurderingForretningssted = props => {
  const {
    bekreftOgFortsett, tilstand, redigerbart, oppdaterData, slettData,
  } = props;

  const {
    omfattetINorge, omfattetILand, lovvalgsbestemmelse, harAvklaring,
  } = tilstand;

  const stegetsLovvalgsbestemmelser = [
    {
      kode: MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART13_1B1,
      label: '13.1 b i: en arbeidsgiver',
    },
    {
      kode: MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART13_1_B2,
      label: '13.1 b ii: to arbeidsgivere',
    },
    {
      kode: MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART13_1_B3,
      label: '13.1 b iii: Flere arbeidsgivere, med forretningssted i to land, hvorav et er Norge',
    },
    {
      kode: MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART13_1_B4,
      label: '13.1 b iv: Flere arbeidsgivere, med forretningssted i flere land, hvorav flere enn to er utenfor Norge',
    },
    {
      kode: MKV.Koder.lovvalgsbestemmelser.forordning_987_2009.FO_987_2009_ART14_11,
      label: '14.11: Forordning 987, artikkel 14: arbeidsgiver utenfor EU/EØS-område',
    },
  ];

  useEffect(() => {
    const bestemmelseFunnet = finnLovvalgsbestemmelse(lovvalgsbestemmelse, stegetsLovvalgsbestemmelser);
    if (bestemmelseFunnet) {
      oppdaterData(konverterLovvalgsbestemmelseTilStegData(lovvalgsbestemmelse));
    }

    oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.OMFATTES_I_NORGE, omfattetINorge));
    oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND, omfattetILand));

    return function cleanup() {
      props.slettData();
    };
  }, []);

  const avklartfaktaEndret = e => {
    if (e === KV.Koder.BoolskAvklartfaktaType.SANN) {
      oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND, null, MKV.Koder.landkoder.NO));
    } else if (e === KV.Koder.BoolskAvklartfaktaType.USANN) {
      slettData(slettAvklartfakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND));
    } else {
      oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND, null, e));
    }
  };

  const lovvalgsbestemmelseEndret = e => {
    oppdaterData(lagLovvalgsbestemmelse(e.target.value));
  };

  const avklartOmfattetINorge = hentFaktaVerdi(omfattetINorge);
  const avklartLand = hentFaktaVerdi(omfattetILand) || '';

  const avklartefaktaTyper = [
    { label: 'Norge', type: KV.Koder.BoolskAvklartfaktaType.SANN },
    { label: 'Annet', type: KV.Koder.BoolskAvklartfaktaType.USANN },
  ];

  return (
    <div>
      <Nav.Undertittel>Vurdering av artikkel 13.1b)</Nav.Undertittel>
      <Nav.Fieldset legend="Vurder hvor virksomhetene har forretningssted">
        <Forretningssteder {...tilstand}{...props} />
      </Nav.Fieldset>

      <Nav.Fieldset legend="Vurder" className="vilkaar">
        <Nav.Select
          name="artikkel3_1_vurdering"
          id="vurdering13_1"
          label="Velg Artikkel"
          onChange={lovvalgsbestemmelseEndret}
          disabled={!redigerbart}
          value={finnLovvalgsbestemmelse(lovvalgsbestemmelse, stegetsLovvalgsbestemmelser)}
        >
          <option />
          { stegetsLovvalgsbestemmelser.map(({ kode, label }) =>
            <option key={kode} value={kode} >{label}</option>)
          }
        </Nav.Select>

      </Nav.Fieldset>
      <EnkeltAvklartfakta
        redigerbart={redigerbart}
        avklartfakta={omfattetINorge}
        avklartfaktaKode={KV.Koder.avklartefaktaKoder.OMFATTES_I_NORGE}
        avklartefaktaTyper={avklartefaktaTyper}
        tittel="Landet søkeren skal omfattes i:"
        oppdaterData={oppdaterData}
        slettData={slettData}
        onChange={avklartfaktaEndret}
      />
      { avklartOmfattetINorge === 'FALSE' &&
      <div className="land">
        <EnkeltLandPure
          label="Velg land:"
          landkoder={MKV.KTObjects.landkoder}
          value={avklartLand}
          onChange={avklartfaktaEndret}
        />
      </div>
      }
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!(redigerbart && harAvklaring)} className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingForretningssted.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  valgteVirksomheter: PT.array,
  avklartForretningsland: PT.array,
  omfattetINorge: PT.object,
  omfattetILand: PT.object,
  lovvalgsbestemmelse: PT.string,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
};

VurderingForretningssted.defaultProps = {
  tilstand: {},
  valgteVirksomheter: [],
  avklartForretningsland: [],
  omfattetINorge: {},
  omfattetILand: {},
  lovvalgsbestemmelse: null,
};

export default VurderingForretningssted;
