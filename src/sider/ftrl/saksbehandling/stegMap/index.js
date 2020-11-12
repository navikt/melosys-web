import Start from './start';
import Bestemmelse from './bestemmelse';
import Virksomhet from './virksomhet';
import Perioder from './perioder';
import Trygdeavgift from './trygdeavgift';
import Representant from './representant';
import Familie from './familie';
import Vedtak from './vedtak';

import { STEG } from '../../../../felleskomponenter/stegvelger/stegMotor/typer';


export const stegMap = new Map([
  [STEG.START, Start],
  [STEG.BESTEMMELSE, Bestemmelse],
  [STEG.VIRKSOMHET, Virksomhet],
  [STEG.PERIODER, Perioder],
  [STEG.TRYGDEAVGIFT, Trygdeavgift],
  [STEG.REPRESENTANT, Representant],
  [STEG.FAMILIE, Familie],
  [STEG.VEDTAK_FTRL, Vedtak],
]);

