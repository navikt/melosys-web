import AvslaaUtpeking from './avslaautpeking';
import GodkjennUtpeking from './godkjennutpeking';
import Inngang from './inngang';
import Virksomheter from './virksomheter';
import VurderUtpeking from './vurderutpeking';

import { STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';

const stegMap = new Map([
  [STEG.INNGANG, Inngang],
  [STEG.VIRKSOMHETER, Virksomheter],
  [STEG.VURDER_UTPEKING, VurderUtpeking],
  [STEG.AVSLAA_UTPEKING, AvslaaUtpeking],
  [STEG.GODKJENN_UTPEKING, GodkjennUtpeking],
]);

export default stegMap;
