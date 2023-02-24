import Start from "./start";
import Bestemmelse from "./bestemmelse";
import Virksomhet from "./virksomhet";
import Perioder from "./perioder";
import Trygdeavgift from "./trygdeavgift";
import Vedtak from "./vedtak";

import { STEG } from "../../../../felleskomponenter/stegvelger";

export const stegMap = new Map([
  [STEG.START, Start],
  [STEG.BESTEMMELSE, Bestemmelse],
  [STEG.VIRKSOMHET, Virksomhet],
  [STEG.PERIODER, Perioder],
  [STEG.TRYGDEAVGIFT, Trygdeavgift],
  [STEG.VEDTAK_FTRL, Vedtak],
]);
