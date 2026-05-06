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
import * as HelseutgiftApi from "../helseutgiftDekkesPeriode/helseutgiftDekkesPeriode";
import {
  type AarsavregningsPeriodeType,
  type Avgiftspliktigperiode,
  type MedlemskapsperiodeForAvgift,
  type HelseutgiftdekkesperiodeForAvgift,
  type MedlemskapsperiodeDto,
  erHelseutgiftdekkesperiode,
  erMedlemskapsperiode,
} from "../types/periodeTyper";
import type { HelseutgiftDekkesPeriodeDto } from "../helseutgiftDekkesPeriode/helseutgiftDekkesPeriode";

const mapMedlemskapsperiodeDto = (dto: MedlemskapsperiodeDto): MedlemskapsperiodeForAvgift => ({
  ...dto,
  type: "MEDLEMSKAPSPERIODE",
});

const mapHelseutgiftDekkesPeriodeDto = (dto: HelseutgiftDekkesPeriodeDto): HelseutgiftdekkesperiodeForAvgift => ({
  fomDato: dto.fomDato,
  tomDato: dto.tomDato,
  id: dto.id ?? 0,
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
      throw new Error("Lovvalgsperioder er ikke støttet enda");
    }
    case "HELSEUTGIFTDEKKESPERIODE": {
      const perioder = await HelseutgiftApi.hentHelseutgiftDekkesPerioder(behandlingID);
      return perioder.map(mapHelseutgiftDekkesPeriodeDto);
    }
  }
};

export const opprettPeriode = async (
  behandlingID: number,
  periode: Avgiftspliktigperiode,
  bestemmelse: string,
): Promise<Avgiftspliktigperiode> => {
  if (erHelseutgiftdekkesperiode(periode)) {
    const request = tilHelseutgiftRequest(periode, periode.bostedLandkode);
    const response = await HelseutgiftApi.opprettHelseutgiftDekkesPeriode(behandlingID, request);
    return mapHelseutgiftDekkesPeriodeDto(response);
  } else if (erMedlemskapsperiode(periode)) {
    const request = tilMedlemskapsperiodeRequest(periode, bestemmelse);
    const response = await MedlemskapsperioderApi.opprettMedlemskapsperioder(behandlingID, request);
    return mapMedlemskapsperiodeDto(response);
  } else {
    throw new Error("Lovvalgsperioder er ikke støttet enda");
  }
};

export const oppdaterPeriode = async (
  behandlingID: number,
  periode: Avgiftspliktigperiode,
  bestemmelse: string,
): Promise<Avgiftspliktigperiode> => {
  if (erMedlemskapsperiode(periode)) {
    const request = tilMedlemskapsperiodeRequest(periode, bestemmelse);
    const response = await MedlemskapsperioderApi.oppdaterMedlemskapsperioder(behandlingID, periode.id, request);
    return mapMedlemskapsperiodeDto(response);
  } else if (erHelseutgiftdekkesperiode(periode)) {
    const request = tilHelseutgiftRequest(periode, periode.bostedLandkode);
    const response = await HelseutgiftApi.oppdaterHelseutgiftDekkesPeriode(behandlingID, periode.id, request);
    return mapHelseutgiftDekkesPeriodeDto(response);
  } else {
    throw new Error("Lovvalgsperioder er ikke støttet enda");
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
      throw new Error("Lovvalgsperioder er ikke støttet enda");
    case "HELSEUTGIFTDEKKESPERIODE":
      await HelseutgiftApi.slettHelseutgiftDekkesPeriode(behandlingID, periodeId);
      return;
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
      throw new Error("Lovvalgsperioder er ikke støttet enda");
    }
    case "HELSEUTGIFTDEKKESPERIODE": {
      const perioder = await HelseutgiftApi.hentHelseutgiftDekkesPerioder(behandlingID);
      const results = await Promise.allSettled(
        perioder
          .filter((periode) => periode.id)
          .map((periode) => HelseutgiftApi.slettHelseutgiftDekkesPeriode(behandlingID, periode.id!)),
      );
      const feilede = results.filter((r) => r.status === "rejected");
      if (feilede.length > 0) {
        throw new Error(`Klarte ikke å slette ${feilede.length} av ${perioder.length} helseutgiftdekkes-perioder`);
      }
      return;
    }
  }
};

export const slettPerioderFraAvgiftssystemet = async (
  periodeType: AarsavregningsPeriodeType,
  behandlingID: number,
): Promise<void> => {
  const kilde = "AVGIFT_SYSTEMET";
  switch (periodeType) {
    case "MEDLEMSKAPSPERIODE":
      await MedlemskapsperioderApi.slettMedlemskapsperioderMedKilde(behandlingID, kilde);
      return;
    case "LOVVALGSPERIODE":
      throw new Error("Lovvalgsperioder er ikke støttet enda");
    case "HELSEUTGIFTDEKKESPERIODE":
      await HelseutgiftApi.slettHelseutgiftDekkesPeriodeMedKilde(behandlingID, kilde);
      return;
  }
};
