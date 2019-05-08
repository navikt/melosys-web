import React, { useEffect } from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';
import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';

import { hentFaktaVerdi, lagAvklartfakta, konverterTilStegData as konverterFaktaTilStegData } from '../../../regler/avklartefakta';
import { konverterTilStegData, lagVilkaar } from '../../../regler/vilkar';
import EnkeltLandPure from '../../skjema/landvelger/enkeltLandPure';
import EnkeltAvklartfakta from './felles/enkeltAvklartfakta';

import './vurderingForretningssted.css';

const Forretningsstedet = props => {
  const { forretningsstedet, avklartForretningsland, oppdaterData } = props;
  if (!forretningsstedet) return null;

  useEffect(() => {
    if (avklartForretningsland) {
      oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.ARBEIDSGIVERS_FORRETNINGSSTED, avklartForretningsland));
    }
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
};

const VurderingForretningssted = props => {
  const {
    bekreftOgFortsett, omfattetINorge, omfattetILand, redigerbart, oppdaterData, slettData,
    art13_1_b1, art13_1_b2, art13_1_b3, art13_1_b4, art14_11,
  } = props;

  const lovvalgsvilkaar = [
    { kode: 'art13_1_b1', vilkaar: art13_1_b1, label: '13.1 b i: en arbeidsgiver' },
    { kode: 'art13_1_b2', vilkaar: art13_1_b2, label: '13.1 b ii: to arbeidsgivere' },
    { kode: 'art13_1_b3', vilkaar: art13_1_b3, label: '13.1 b iii: Flere arbeidsgivere, med forretningssted i to land, hvorav et er Norge' },
    { kode: 'art13_1_b4', vilkaar: art13_1_b4, label: '13.1 b iv: Flere arbeidsgivere, med forretningssted i flere land, hvorav flere enn to er utenfor Norge' },
    { kode: 'art14_11', vilkaar: art14_11, label: '14.11: Forordning 987, artikkel 14: arbeidsgiver utenfor EU/EØS-område' },
  ];

  useEffect(() => {
    lovvalgsvilkaar.forEach(({ kode, vilkaar }) => oppdaterData(konverterTilStegData(kode, vilkaar)));
    oppdaterData(konverterFaktaTilStegData(KV.Koder.avklartefaktaKoder.OMFATTES_I_NORGE, omfattetINorge));
    oppdaterData(konverterFaktaTilStegData(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND, omfattetILand));

    return function cleanup() {
      props.slettAllDataForSteg();
    };
  }, []);

  const avklartfaktaEndret = e => {
    if (e === 'TRUE') {
      oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND, null, 'NO'));
    } else if (e === 'FALSE') {
      slettData('avklartefakta', KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND);
    } else {
      oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND, null, e));
    }
  };

  const vilkaarEndret = e => {
    oppdaterData(lagVilkaar(e.target.value, true));

    // Det er kun mulig å ha et av vilkårene. Det er derfor nødvendig å gå gjennom og slette de andre.
    lovvalgsvilkaar
      .filter(lv => lv.kode !== e.target.value)
      .forEach(lv => slettData('vilkaar', lv.kode));
  };

  const finnOppfyltVilkaarKode = () => {
    const oppfyltVilkaar = lovvalgsvilkaar.find(lv => lv.vilkaar.oppfylt) || {};
    return oppfyltVilkaar.kode;
  };

  const avklartOmfattetINorge = hentFaktaVerdi(omfattetINorge);
  const avklartLand = hentFaktaVerdi(omfattetILand);

  const avklartefaktaTyper = [
    { label: 'Norge', type: 'TRUE' },
    { label: 'Annet', type: 'FALSE' },
  ];

  return (
    <div>
      <Nav.Undertittel>Vurder arbeidsgivers forretningssted</Nav.Undertittel>
      <Nav.Fieldset legend="Vurder hvor virksomhetene har forretningssted">
        <Forretningssteder {...props} />
      </Nav.Fieldset>

      <Nav.Fieldset legend="Vurder" className="vilkaar">
        <Nav.Select
          name="artikkel3_1_vurdering"
          id="vurdering13_1"
          label="Velg Artikkel"
          onChange={vilkaarEndret}
          disabled={!redigerbart}
          value={finnOppfyltVilkaarKode()}
        >
          <option />
          { lovvalgsvilkaar.map(({ kode, label }) =>
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
        onChange={avklartfaktaEndret}
      />
      { avklartOmfattetINorge === 'FALSE' &&
      <div className="land">
        <EnkeltLandPure
          landkoder={MKV.KTObjects.landkoder}
          value={avklartLand}
          onChange={avklartfaktaEndret}
        />
      </div>
      }
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
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
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  slettAllDataForSteg: PT.func.isRequired,
};

VurderingForretningssted.defaultProps = {
  tilstand: {},
  valgteVirksomheter: [],
  avklartForretningsland: [],
  omfattetINorge: {},
  omfattetILand: {},
};

export default VurderingForretningssted;
