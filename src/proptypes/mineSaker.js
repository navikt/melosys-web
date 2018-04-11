import PT from 'prop-types';
import * as MPT from './index';

const SakEnkeltLinjePropType = PT.shape({
  sammensattNavn: PT.string,
  sakstype: MPT.Kodeverk,
  behandling: PT.shape({
    status: MPT.Kodeverk,
    type: MPT.Kodeverk,
  }),
  soknadsperiode: MPT.Periode,
});

const MineSakerPropType = PT.arrayOf(SakEnkeltLinjePropType);

export {
  SakEnkeltLinjePropType as SakEnkeltLinje,
  MineSakerPropType as MineSaker,
};
