import React, { useEffect } from "react";
import PT from "prop-types";

import MKV from "../../../melosyskodeverk";
import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";
import * as MPT from "../../../proptypes";
import * as Utils from "../../../utils";
import * as Mui from "../../../felleskomponenter/ui";

import { hentFaktaVerdi, finnLovvalgsbestemmelse } from "../../../domeneUtils";
import {
  lagAvklartfakta,
  konverterAvklartfaktaTilStegData,
  slettAvklartfakta,
  konverterLovvalgsbestemmelseTilStegData,
  lagLovvalgsbestemmelse,
} from "../../../felleskomponenter/stegvelger";

import EnkeltLandPure from "../../../felleskomponenter/skjema/landvelger/enkeltLandPure";
import EnkeltAvklartfakta from "./felles/enkeltAvklartfakta";
import { BOOLSK_STRING } from "../../../constants";

import "./vurderingForretningssted.css";

const Forretningsstedet = (props) => {
  const { forretningsstedet, avklartForretningsland, oppdaterData, slettData, redigerbart } = props;

  useEffect(() => {
    if (avklartForretningsland) {
      oppdaterData(
        konverterAvklartfaktaTilStegData(
          MKV.Koder.avklartefaktatyper.ARBEIDSGIVERS_FORRETNINGSSTED,
          avklartForretningsland
        )
      );
    }
    const cleanup = () => {
      slettData(
        slettAvklartfakta(MKV.Koder.avklartefaktatyper.ARBEIDSGIVERS_FORRETNINGSSTED, forretningsstedet.virksomhetId)
      );
    };
    return cleanup;
  }, []);

  const { navn, virksomhetId } = forretningsstedet;
  const landEndretHandler = (landKode) => {
    oppdaterData(lagAvklartfakta(MKV.Koder.avklartefaktatyper.ARBEIDSGIVERS_FORRETNINGSSTED, virksomhetId, landKode));
  };

  const eksisterendeLand = hentFaktaVerdi(avklartForretningsland) || "";

  return (
    <Nav.Fieldset legend={navn} className="forretningssted">
      <EnkeltLandPure
        label="Har forretningssted i"
        onChange={landEndretHandler}
        value={eksisterendeLand}
        landkoder={MKV.KTObjects.landkoder}
        multiland={false}
        disabled={!redigerbart}
      />
    </Nav.Fieldset>
  );
};

Forretningsstedet.propTypes = {
  forretningsstedet: PT.object.isRequired,
  avklartForretningsland: PT.object,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

Forretningsstedet.defaultProps = {
  avklartForretningsland: null,
};

export const Forretningssteder = (props) => {
  const { valgteVirksomheter, avklarteForretningsland, redigerbart } = props;

  const ingenValgteVirksomheterVarsel = valgteVirksomheter.length === 0 && (
    <Nav.AlertStripe type="advarsel">Finner ingen valgte virksomheter.</Nav.AlertStripe>
  );

  return (
    <div>
      {valgteVirksomheter
        .filter((valgtVirksomhet) => valgtVirksomhet !== null)
        .map((valgtVirksomhet) => {
          const key = `forretningssted${valgtVirksomhet.virksomhetId}-${valgtVirksomhet.navn}`;
          const avklartForretningsland = avklarteForretningsland.find(
            (enkeltAvklaring) => enkeltAvklaring.subjektID === valgtVirksomhet.virksomhetId
          );

          return (
            <Forretningsstedet
              key={key}
              forretningsstedet={valgtVirksomhet}
              avklartForretningsland={avklartForretningsland}
              oppdaterData={props.oppdaterData}
              slettData={props.slettData}
              redigerbart={redigerbart}
            />
          );
        })}
      {ingenValgteVirksomheterVarsel}
    </div>
  );
};

Forretningssteder.propTypes = {
  valgteVirksomheter: PT.array.isRequired,
  avklarteForretningsland: PT.array.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

export const VurderingForretningssted = (props) => {
  const { bekreftOgFortsett, tilstand, redigerbart, oppdaterData, slettData, tilbake } = props;

  const { omfattetINorge, omfattetILand, lovvalgsbestemmelse, harAvklaring } = tilstand;

  const stegetsLovvalgsbestemmelser = [
    {
      kode: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B1,
      label: "13.1 b i: en arbeidsgiver",
    },
    {
      kode: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B2,
      label: "13.1 b ii: Ansatt av to eller flere arbeidsgivere med forretningssted i samme land",
    },
    {
      kode: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B3,
      label: "13.1 b iii: To eller flere arbeidsgivere, med forretningssted i to land, hvorav ett er Norge",
    },
    {
      kode: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B4,
      label: "13.1 b iv: Flere arbeidsgivere, med forretningssted i flere land, hvorav flere enn to er utenfor Norge",
    },
    {
      kode: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009.FO_987_2009_ART14_11,
      label: "14.11: Forordning 987, artikkel 14: arbeidsgiver utenfor EU/EØS-område",
    },
  ];

  useEffect(() => {
    const bestemmelseFunnet = finnLovvalgsbestemmelse(lovvalgsbestemmelse, stegetsLovvalgsbestemmelser);
    if (bestemmelseFunnet) {
      oppdaterData(konverterLovvalgsbestemmelseTilStegData(lovvalgsbestemmelse));
    }

    oppdaterData(konverterAvklartfaktaTilStegData(KV.Koder.avklartefaktaKoder.OMFATTES_I_NORGE, omfattetINorge));
    oppdaterData(konverterAvklartfaktaTilStegData(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND, omfattetILand));

    const cleanup = () => {
      slettData();
    };
    return cleanup;
  }, []);

  const avklartfaktaEndret = (e) => {
    if (e === BOOLSK_STRING.SANN) {
      oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND, null, MKV.Koder.landkoder.NO));
    } else if (e === BOOLSK_STRING.USANN) {
      slettData(slettAvklartfakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND));
    } else {
      oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND, null, e));
    }
  };

  const lovvalgsbestemmelseEndret = (e) => {
    oppdaterData(lagLovvalgsbestemmelse(e.target.value));
  };

  const avklartOmfattetINorge = hentFaktaVerdi(omfattetINorge);
  const avklartLand = hentFaktaVerdi(omfattetILand) || "";

  const avklartefaktaTyper = [
    { label: "Norge", type: BOOLSK_STRING.SANN },
    { label: "Annet", type: BOOLSK_STRING.USANN },
  ];

  return (
    <div>
      <Nav.Typo.Undertittel>Vurdering av artikkel 13 nr. 1 bokstav b</Nav.Typo.Undertittel>
      <Nav.Fieldset legend="Velg hvor virksomhetene har forretningssted" className="forretningssteder">
        <Forretningssteder {...tilstand} {...props} />
      </Nav.Fieldset>

      <Nav.Fieldset legend="Velg artikkel" className="vilkaar">
        <Nav.Select
          name="artikkel3_1_vurdering"
          id="vurdering13_1"
          label=""
          onChange={lovvalgsbestemmelseEndret}
          disabled={!redigerbart}
          value={finnLovvalgsbestemmelse(lovvalgsbestemmelse, stegetsLovvalgsbestemmelser)}
        >
          <option key={Utils._uuid()} value="">
            Velg artikkel
          </option>
          {stegetsLovvalgsbestemmelser.map(({ kode, label }, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <option key={index} value={kode}>
              {label}
            </option>
          ))}
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
      {avklartOmfattetINorge === "FALSE" && (
        <div className="land">
          <EnkeltLandPure
            label="Velg land:"
            landkoder={MKV.KTObjects.landkoder}
            value={avklartLand}
            onChange={avklartfaktaEndret}
            disabled={!redigerbart}
          />
        </div>
      )}
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !(redigerbart && harAvklaring),
          onClick: bekreftOgFortsett,
        }}
        tilbakeKnappProps={{
          onClick: tilbake,
          disabled: !redigerbart,
        }}
      />
    </div>
  );
};

VurderingForretningssted.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.shape({
    omfattetINorge: PT.object,
    omfattetILand: PT.object,
    lovvalgsbestemmelse: PT.string,
    avklarteForretningsland: PT.arrayOf(MPT.Avklartefakta),
    harAvklaring: PT.bool.isRequired,
  }).isRequired,
  valgteVirksomheter: PT.arrayOf(MPT.Virksomhet),
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  tilbake: PT.func.isRequired,
};

VurderingForretningssted.defaultProps = {
  valgteVirksomheter: [],
};

export default VurderingForretningssted;
