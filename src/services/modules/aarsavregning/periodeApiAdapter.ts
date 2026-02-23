/**
 * Adapter for CRUD-operasjoner på årsavregningsperioder.
 *
 * Ruter kall til riktig backend-endepunkt basert på Avgiftspliktigperiode.type:
 * - MEDLEMSKAPSPERIODE       → medlemskapsperioder-API
 * - LOVVALGSPERIODE          → lovvalgsperioder-API
 * - HELSEUTGIFTDEKKESPERIODE → helseutgiftDekkesPeriode-API
 *
 * Mapper response-DTO-er tilbake til Avgiftspliktigperiode-unionen.
 */

import * as MedlemskapsperioderApi from "../medlemavfolketrygden/medlemskapsperioder";
import * as LovvalgsperioderApi from "../lovvalgsperioder";
import * as HelseutgiftApi from "../helseutgiftDekkesPeriode/helseutgiftDekkesPeriode";
import type {
  AarsavregningsPeriodeType,
  Avgiftspliktigperiode,
  MedlemskapsperiodeForAvgift,
  LovvalgsperiodeForAvgift,
  HelseutgiftdekkesperiodeForAvgift,
  MedlemskapsperiodeDto,
} from "../types/periodeTyper";
import type { Lovvalgsperiode } from "../lovvalgsperioder";
import type { HelseutgiftDekkesPeriodeDto } from "../helseutgiftDekkesPeriode/helseutgiftDekkesPeriode";

const mapMedlemskapsperiodeDto = (dto: MedlemskapsperiodeDto): MedlemskapsperiodeForAvgift => ({
  ...dto,
  type: "MEDLEMSKAPSPERIODE",
});

const mapLovvalgsperiodeDto = (dto: Lovvalgsperiode): LovvalgsperiodeForAvgift => ({
  fomDato: dto.fomDato,
  tomDato: dto.tomDato ?? "",
  id: dto.periodeID ? Number(dto.periodeID) : 0,
  type: "LOVVALGSPERIODE",
  bestemmelse: dto.lovvalgsbestemmelse ?? "",
  innvilgelsesResultat: dto.innvilgelsesResultat,
  trygdedekning: dto.trygdeDekning,
  medlemskapstype: dto.medlemskapstype,
});

const HELSEUTGIFT_SENTINEL_ID = 0;

const mapHelseutgiftDekkesPeriodeDto = (dto: HelseutgiftDekkesPeriodeDto): HelseutgiftdekkesperiodeForAvgift => ({
  fomDato: dto.fomDato,
  tomDato: dto.tomDato,
  id: HELSEUTGIFT_SENTINEL_ID,
  type: "HELSEUTGIFTDEKKESPERIODE",
  bostedLandkode: dto.bostedLandkode,
});

const tilMedlemskapsperiodeRequest = (
  periode: MedlemskapsperiodeForAvgift,
  bestemmelse: string,
): MedlemskapsperioderApi.OppdaterMedlemskapsperiode => ({
  fomDato: periode.fomDato,
  tomDato: periode.tomDato,
  trygdedekning: periode.trygdedekning,
  bestemmelse,
  innvilgelsesResultat: periode.innvilgelsesResultat,
});

const tilLovvalgsperiodeRequest = (periode: LovvalgsperiodeForAvgift): LovvalgsperioderApi.OpprettLovvalgsperiode => ({
  fomDato: periode.fomDato,
  tomDato: periode.tomDato,
  lovvalgsbestemmelse: periode.bestemmelse,
  trygdedekning: periode.trygdedekning,
  innvilgelsesResultat: periode.innvilgelsesResultat,
});

const tilHelseutgiftRequest = (
  periode: HelseutgiftdekkesperiodeForAvgift,
  bostedLandkode: string,
): HelseutgiftDekkesPeriodeDto => ({
  fomDato: periode.fomDato,
  tomDato: periode.tomDato,
  bostedLandkode,
});

export const hentPerioder = async (
  periodeType: AarsavregningsPeriodeType,
  behandlingID: number,
): Promise<Avgiftspliktigperiode[]> => {
  switch (periodeType) {
    case "MEDLEMSKAPSPERIODE": {
      const perioder = await MedlemskapsperioderApi.hentMedlemskapsperioder(behandlingID);
      return perioder.map(mapMedlemskapsperiodeDto);
    }
    case "LOVVALGSPERIODE": {
      const perioder = await LovvalgsperioderApi.hent(behandlingID);
      return perioder.map(mapLovvalgsperiodeDto);
    }
    case "HELSEUTGIFTDEKKESPERIODE": {
      try {
        const periode = await HelseutgiftApi.hentHelseutgiftDekkesPeriode(behandlingID);
        return [mapHelseutgiftDekkesPeriodeDto(periode)];
      } catch {
        return [];
      }
    }
  }
};

export const opprettPeriode = async (
  periodeType: AarsavregningsPeriodeType,
  behandlingID: number,
  periode: Avgiftspliktigperiode,
  bestemmelse: string,
): Promise<Avgiftspliktigperiode> => {
  switch (periodeType) {
    case "MEDLEMSKAPSPERIODE": {
      const request = tilMedlemskapsperiodeRequest(periode as MedlemskapsperiodeForAvgift, bestemmelse);
      const response = await MedlemskapsperioderApi.opprettMedlemskapsperioder(behandlingID, request);
      return mapMedlemskapsperiodeDto(response);
    }
    case "LOVVALGSPERIODE": {
      const request = tilLovvalgsperiodeRequest(periode as LovvalgsperiodeForAvgift);
      const perioder = await LovvalgsperioderApi.opprettLovvalgsperiode(behandlingID, request);
      const nyeste = perioder[perioder.length - 1];
      return mapLovvalgsperiodeDto(nyeste);
    }
    case "HELSEUTGIFTDEKKESPERIODE": {
      const typed = periode as HelseutgiftdekkesperiodeForAvgift;
      const request = tilHelseutgiftRequest(typed, typed.bostedLandkode);
      await HelseutgiftApi.opprettHelseutgiftDekkesPeriode(behandlingID, request);
      return { ...typed, id: HELSEUTGIFT_SENTINEL_ID };
    }
  }
};

export const oppdaterPeriode = async (
  periodeType: AarsavregningsPeriodeType,
  behandlingID: number,
  periode: Avgiftspliktigperiode,
  bestemmelse: string,
): Promise<Avgiftspliktigperiode> => {
  switch (periodeType) {
    case "MEDLEMSKAPSPERIODE": {
      const typed = periode as MedlemskapsperiodeForAvgift;
      const request = tilMedlemskapsperiodeRequest(typed, bestemmelse);
      const response = await MedlemskapsperioderApi.oppdaterMedlemskapsperioder(behandlingID, typed.id, request);
      return mapMedlemskapsperiodeDto(response);
    }
    case "LOVVALGSPERIODE": {
      const typed = periode as LovvalgsperiodeForAvgift;
      const fullLovvalgsperiode: Lovvalgsperiode = {
        periodeID: String(typed.id),
        fomDato: typed.fomDato,
        tomDato: typed.tomDato,
        lovvalgsbestemmelse: typed.bestemmelse,
        lovvalgsland: "",
        innvilgelsesResultat: typed.innvilgelsesResultat,
        trygdeDekning: typed.trygdedekning,
        medlemskapstype: typed.medlemskapstype,
      };
      const response = await LovvalgsperioderApi.oppdaterLovvalgsperiode(behandlingID, typed.id, fullLovvalgsperiode);
      return mapLovvalgsperiodeDto(response);
    }
    case "HELSEUTGIFTDEKKESPERIODE":
      throw new Error("Oppdatering av helseutgiftdekkesperiode er ikke støttet — bruk opprettPeriode");
  }
};

export const slettPeriode = async (
  periodeType: AarsavregningsPeriodeType,
  behandlingID: number,
  periodeId: number,
): Promise<void> => {
  switch (periodeType) {
    case "MEDLEMSKAPSPERIODE":
      await MedlemskapsperioderApi.slettMedlemskapsperiode(behandlingID, periodeId);
      return;
    case "LOVVALGSPERIODE":
      await LovvalgsperioderApi.slettLovvalgsperiode(behandlingID, periodeId);
      return;
    case "HELSEUTGIFTDEKKESPERIODE":
      throw new Error("Sletting av helseutgiftdekkesperiode er ikke støttet");
  }
};

export const slettAllePerioder = async (
  periodeType: AarsavregningsPeriodeType,
  behandlingID: number,
): Promise<void> => {
  switch (periodeType) {
    case "MEDLEMSKAPSPERIODE":
      await MedlemskapsperioderApi.slettMedlemskapsperioder(behandlingID);
      return;
    case "LOVVALGSPERIODE": {
      const perioder = await LovvalgsperioderApi.hent(behandlingID);
      for (const periode of perioder) {
        if (periode.periodeID) {
          await LovvalgsperioderApi.slettLovvalgsperiode(behandlingID, Number(periode.periodeID));
        }
      }
      return;
    }
    case "HELSEUTGIFTDEKKESPERIODE":
      throw new Error("Sletting av helseutgiftdekkesperiode er ikke støttet");
  }
};
