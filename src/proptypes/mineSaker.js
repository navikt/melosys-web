import PT from 'prop-types';
import * as MPT from './index';

const MinSakPropType = PT.shape({
  sammensattNavn: PT.string.isRequired,
  sakstype: MPT.Kodeverk,
  behandling: PT.shape({
    status: MPT.Kodeverk,
    type: MPT.Kodeverk,
  }),
  soknadsperiode: MPT.Periode,
});

const MineSakerPropType = PT.arrayOf(MinSakPropType);

export {
  MinSakPropType,
  MineSakerPropType,
};
