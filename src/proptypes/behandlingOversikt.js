import PT from 'prop-types';
import { Kodeverk } from './kodeverk';
import { Periode } from './periode';

const BehandligOversiktPropType = PT.shape({
  behandlingID: PT.number,
  behandlingsstatus: Kodeverk,
  behandlingstype: Kodeverk,
  land: PT.arrayOf(PT.string),
  opprettetDato: PT.string,
  soknadsperiode: Periode,
});
const BehandligOversikterPropType = PT.arrayOf(BehandligOversiktPropType);
export {
  BehandligOversiktPropType as BehandligOversikt,
  BehandligOversikterPropType as BehandligOversikter,
};
