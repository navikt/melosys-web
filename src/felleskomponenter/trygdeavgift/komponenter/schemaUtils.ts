import MKV from "../../../melosyskodeverk";
import { BOOLSK_STRING } from "../../../constants";

const {
  NÆRINGSINNTEKT_FRA_NORGE,
  INNTEKT_FRA_UTLANDET,
  FN_SKATTEFRITAK,
  MISJONÆR,
  PENSJON_UFØRETRYGD,
  PENSJON_UFØRETRYGD_KILDESKATT,
} = MKV.Koder.inntektskildetype;

export const arbAvgBetalesKreves = (kildetype: string, medlemskapsTypeErPliktig: boolean) =>
  !medlemskapsTypeErPliktig && kildetype !== MISJONÆR;

export const bruttoInntektKreves = (
  brukerSkattepliktigIHelePerioden: boolean,
  kildetype: string,
  arbAvgBetales?: string,
) =>
  !brukerSkattepliktigIHelePerioden ||
  [NÆRINGSINNTEKT_FRA_NORGE, FN_SKATTEFRITAK, PENSJON_UFØRETRYGD].includes(kildetype) ||
  ([INNTEKT_FRA_UTLANDET, PENSJON_UFØRETRYGD_KILDESKATT].includes(kildetype) && arbAvgBetales === BOOLSK_STRING.USANN);
