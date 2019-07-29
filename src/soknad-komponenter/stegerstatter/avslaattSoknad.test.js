import React from 'react';

import AvslaattSoknad from './avslaattSoknad';
import StegvelgerBase from './stegerstatterBase';

describe('AvslattSoknad', () => {
  it('viser en StegvelgerBase', () => {
    const avslaattSoknad = shallow(<AvslaattSoknad />);

    expect(avslaattSoknad.find(StegvelgerBase)).toHaveLength(1);
  });
});
