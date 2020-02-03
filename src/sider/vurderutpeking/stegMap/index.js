import Inngang from './inngang';
import Virksomheter from './virksomheter';

import { STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';

const stegMap = new Map([
  [STEG.INNGANG, Inngang],
  [STEG.VIRKSOMHETER, Virksomheter],
]);

export default stegMap;
