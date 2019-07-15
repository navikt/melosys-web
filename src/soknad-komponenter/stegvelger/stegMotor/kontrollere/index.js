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
import Artikkel16 from './artikkel16';
import Artikkel16MottaSvar from './artikkel16_motta_svar';
import Artikkel16Vedtak from './artikkel16_vedtak';
import VirksomhetType from './virksomhet_type';
import VesentligVirksomhet from './vesentlig_virksomhet';
import NormaltDriverVirksomhet from './normalt_driver_virksomhet';
import YrkesaktivitetAntallLand from './yrkesaktivitet_antall_land';
import Arbeidsmonster from './arbeidsmonster';
import SokkelSkip from './sokkel_skip';
import Vedtak from './vedtak';
import EndrePeriode from './endre_periode';

import { STEG } from '../typer';

export const stegKatalogMap = new Map([
  [STEG.INNGANG, Inngang],
  [STEG.AVSLAG_12_X_OG_16, Avslag_12_x_og_16],
  [STEG.ARTIKKEL_16, Artikkel16],
  [STEG.ARTIKKEL_16_MOTTA_SVAR, Artikkel16MottaSvar],
  [STEG.ARTIKKEL_16_VEDTAK, Artikkel16Vedtak],
  [STEG.ARTIKKEL_12_1, Artikkel12_1],
  [STEG.ARTIKKEL_12_2, Artikkel12_2],
  [STEG.ARTIKKEL_11_4, Artikkel11_4],
  [STEG.ARTIKKEL_13_1_A_VEDTAK, Artikkel13_1_A_Vedtak],
  [STEG.YRKESGRUPPE, Yrkesgruppe],
  [STEG.IKKE_YRKESAKTIV, IkkeYrkesaktiv],
  [STEG.FORUTGAENDE_MEDLEMSKAP, ForutgaendeMedlemskap],
  [STEG.YRKESAKTIVITET, Yrkesaktivitet],
  [STEG.YRKESAKTIVITET_ANTALL_LAND, YrkesaktivitetAntallLand],
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
]);

