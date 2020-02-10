import AvslaaUtpeking from './avslaautpeking';
import Inngang from './inngang';
import Virksomheter from './virksomheter';
import VurderUtpeking from './vurderutpeking';

import { STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';

const stegMap = new Map([
  [STEG.INNGANG, Inngang],
  [STEG.VIRKSOMHETER, Virksomheter],
  [STEG.VURDER_UTPEKING, VurderUtpeking],
  [STEG.AVSLAA_UTPEKING, AvslaaUtpeking],
]);

export default stegMap;
