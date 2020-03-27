import AvslaaUtpeking from './avslaautpeking';
import GodkjennUtpekingNorge from './godkjennutpekingnorge';
import GodkjennUtpekingAnnetLand from './godkjennutpekingannetland';
import Inngang from './inngang';
import Virksomheter from './virksomheter';
import VurderUtpeking from './vurderutpeking';

import { STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';

const stegMap = new Map([
  [STEG.INNGANG, Inngang],
  [STEG.VIRKSOMHETER, Virksomheter],
  [STEG.VURDER_UTPEKING, VurderUtpeking],
  [STEG.AVSLAA_UTPEKING, AvslaaUtpeking],
  [STEG.GODKJENN_UTPEKING_NORGE, GodkjennUtpekingNorge],
  [STEG.GODKJENN_UTPEKING_ANNET_LAND, GodkjennUtpekingAnnetLand],
]);

export default stegMap;
