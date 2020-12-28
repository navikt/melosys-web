import React from 'react';

import { BehandlingsgrunnlagFeilmeldinger } from './behandlingsgrunnlagFeilmeldinger';

describe('BehandlingsgrunnlagFeilmeldinger', () => {
  let props = null;

  beforeEach(() => {
    props = {
      panelFeil: [
        {
          panel: 'Soknadsperiode',
          feil: [
            'Åpen sluttdato',
          ],
        },
        {
          panel: 'Personlig info',
          feil: [
            'Ugyldig fnr',
          ],
        },
      ],
    };
  });

  it('viser en liste over paneler som har feil', () => {
    const behandlingsgrunnlagFeilmeldinger = shallow(<BehandlingsgrunnlagFeilmeldinger {...props} />);

    const lis = behandlingsgrunnlagFeilmeldinger.find('li');

    expect(lis.containsMatchingElement('Soknadsperiode'));
    expect(lis.containsMatchingElement('Personlig info'));
  });

  it('viser ingenting hvis ingen panelfeil', () => {
    props.panelFeil = [];
    const behandlingsgrunnlagFeilmeldinger = shallow(<BehandlingsgrunnlagFeilmeldinger {...props} />);

    expect(behandlingsgrunnlagFeilmeldinger.isEmptyRender()).toBe(true);
  });
});
