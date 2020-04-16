import Aktivitet from './aktivitet';
import Virksomheter from './virksomheter';
import Avslag_12_x_og_16 from './avslag_12_x_og_16';
import Bostedsland from './bostedsland';
import Forretningssted from './forretningssted';
import ForutgaendeMedlemskap from './forutgaende_medlemskap';
import IkkeYrkesaktiv from './ikke_yrkesaktiv';
import Inngang from './inngang';
import Yrkesaktivitet from './yrkesaktivitet';
import Yrkesgruppe from './yrkesgruppe';
import Tjenestemann from './tjenestemann';
import Artikkel12_1 from './artikkel12_1';
import Artikkel12_2 from './artikkel12_2';
import Artikkel11_4 from './artikkel11_4';
import Artikkel13_1_A_Vedtak from './artikkel13_1_a_vedtak';
import Artikkel13_1_B_Vedtak from './artikkel13_1_b_vedtak';
import Artikkel13_1_B_UtpekLand from './artikkel13_1_b_utpek_land';
import Artikkel13_2_B from './artikkel13_2b';
import Artikkel13_2_B_UtpekLand from './artikkel13_2_b_utpek_land';
import Artikkel13_2_A_Vedtak from './artikkel13_2_a_vedtak';
import Artikkel13_2_B_Norge from './artikkel13_2_b_norge';
import Artikkel13_3_Vedtak from './artikkel13_3_vedtak';
import Artikkel13_4_Vedtak from './artikkel13_4_vedtak';
import Artikkel13_4_UtpekLand from './artikkel13_4_utpekland';
import Artikkel16Anmodning from './artikkel16_anmodning';
import Artikkel16MottaSvar from './artikkel16_motta_svar';
import Artikkel16Vedtak from './artikkel16_vedtak';
import VirksomhetType from './virksomhet_type';
import VesentligVirksomhet from './vesentlig_virksomhet';
import NormaltDriverVirksomhet from './normalt_driver_virksomhet';
import Arbeidsmonster from './arbeidsmonster';
import SokkelSkip from './sokkel_skip';
import Vedtak from './vedtak';
import EndrePeriode from './endre_periode';
import Videresend from './videresend';
import VurderArbeidsland from './vurderarbeidsland';

import { STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';

export const stegMap = new Map([
  [STEG.INNGANG, Inngang],
  [STEG.AVSLAG_12_X_OG_16, Avslag_12_x_og_16],
  [STEG.ARTIKKEL_16_ANMODNING, Artikkel16Anmodning],
  [STEG.ARTIKKEL_16_MOTTA_SVAR, Artikkel16MottaSvar],
  [STEG.ARTIKKEL_16_VEDTAK, Artikkel16Vedtak],
  [STEG.ARTIKKEL_12_1, Artikkel12_1],
  [STEG.ARTIKKEL_12_2, Artikkel12_2],
  [STEG.ARTIKKEL_11_4, Artikkel11_4],
  [STEG.ARTIKKEL_13_1_A_VEDTAK, Artikkel13_1_A_Vedtak],
  [STEG.ARTIKKEL_13_1_B_VEDTAK, Artikkel13_1_B_Vedtak],
  [STEG.ARTIKKEL_13_1_B_UTPEK_LAND, Artikkel13_1_B_UtpekLand],
  [STEG.ARTIKKEL_13_2_B, Artikkel13_2_B],
  [STEG.ARTIKKEL_13_2_B_UTPEK_LAND, Artikkel13_2_B_UtpekLand],
  [STEG.ARTIKKEL_13_2_A_VEDTAK, Artikkel13_2_A_Vedtak],
  [STEG.ARTIKKEL_13_2_B_NORGE, Artikkel13_2_B_Norge],
  [STEG.ARTIKKEL_13_3_VEDTAK, Artikkel13_3_Vedtak],
  [STEG.ARTIKKEL_13_4_VEDTAK, Artikkel13_4_Vedtak],
  [STEG.ARTIKKEL_13_4_UTPEK_LAND, Artikkel13_4_UtpekLand],
  [STEG.YRKESGRUPPE, Yrkesgruppe],
  [STEG.IKKE_YRKESAKTIV, IkkeYrkesaktiv],
  [STEG.FORUTGAENDE_MEDLEMSKAP, ForutgaendeMedlemskap],
  [STEG.YRKESAKTIVITET, Yrkesaktivitet],
  [STEG.ARBEIDSMONSTER, Arbeidsmonster],
  [STEG.VIRKSOMHET_TYPE, VirksomhetType],
  [STEG.VESENTLIG_VIRKSOMHET, VesentligVirksomhet],
  [STEG.NORMALT_DRIVER_VIRKSOMHET, NormaltDriverVirksomhet],
  [STEG.AKTIVITET, Aktivitet],
  [STEG.BOSTEDSLAND, Bostedsland],
  [STEG.TJENESTEMANN, Tjenestemann],
  [STEG.FORRETNINGSSTED, Forretningssted],
  [STEG.VIRKSOMHETER, Virksomheter],
  [STEG.SOKKEL_SKIP, SokkelSkip],
  [STEG.VEDTAK, Vedtak],
  [STEG.ENDRET_PERIODE, EndrePeriode],
  [STEG.VIDERESEND, Videresend],
  [STEG.VURDER_ARBEIDSLAND, VurderArbeidsland],
]);

