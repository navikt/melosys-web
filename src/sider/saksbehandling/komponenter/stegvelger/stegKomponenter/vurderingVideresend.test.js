import React from 'react';

import VurderingVideresend from './vurderingVideresend';

describe('Vurderingvideresend', () => {
  it('vises uten å krasje', () => {
    shallow(<VurderingVideresend />);
  });
});
