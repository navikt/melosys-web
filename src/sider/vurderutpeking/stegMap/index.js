import Inngang from './inngang';
import Virksomheter from './virksomheter';
import VurderUtpeking from './vurderutpeking';

import { STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';

const stegMap = new Map([
  [STEG.INNGANG, Inngang],
  [STEG.VIRKSOMHETER, Virksomheter],
  [STEG.VURDER_UTPEKING, VurderUtpeking],
]);

export default stegMap;
