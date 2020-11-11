import Start from './start';
import Vurdering from './vurderinger';
import Virksomhet from './virksomhet';
import Medlemskap from './medlemskap';
import Avgift from './avgift';
import Representant from './representant';
import Familie from './familie';
import Vedtak from './vedtak';

import { STEG } from '../../../../felleskomponenter/stegvelger/stegMotor/typer';


export const stegMap = new Map([
  [STEG.START, Start],
  [STEG.VURDERING, Vurdering],
  [STEG.VIRKSOMHET, Virksomhet],
  [STEG.MEDLEMSKAP, Medlemskap],
  [STEG.AVGIFT, Avgift],
  [STEG.REPRESENTANT, Representant],
  [STEG.FAMILIE, Familie],
  [STEG.VEDTAK_FTRL, Vedtak],
]);

