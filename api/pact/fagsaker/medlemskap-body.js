import periode from './periode-body';

const { Matchers } = require('@pact-foundation/pact');

const { like, eachLike } = Matchers;

const medlemskapsperiode = eachLike({
  periode,
  type: like('PMMEDSKP'),
  status: like('AVST'),
  grunnlagstype: like('MEDEOS'),
  land: like('NOR'),
  lovvalg: like('ENDL'),
  trygdedekning: like('Full'),
  kildedokumenttype: like('E101'),
  kilde: like('FS22'),
});

const medlemskap = {
  medlemskapsperiode,
};

export default medlemskap;
