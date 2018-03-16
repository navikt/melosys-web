import periode from '../periode-body';
import kodeverk from '../kodeverk-body';

const { Matchers } = require('@pact-foundation/pact');

const { like, eachLike } = Matchers;

const medlemskapsperiode = eachLike({
  periode,
  type: kodeverk,
  status: kodeverk,
  grunnlagstype: kodeverk,
  land: kodeverk,
  lovvalg: kodeverk,
  trygdedekning: like('Full'),
  kildedokumenttype: like('E101'),
  kilde: like('FS22'),
});

const medlemskap = {
  medlemskapsperiode,
};

export default medlemskap;
