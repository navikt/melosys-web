import React from 'react';

import { SoknadFeilmeldinger } from './soknadFeilmeldinger';

describe('SoknadFeilmeldinger', () => {
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
    const soknadFeilmeldinger = shallow(<SoknadFeilmeldinger {...props} />);

    const lis = soknadFeilmeldinger.find('li');

    expect(lis.containsMatchingElement('Soknadsperiode'));
    expect(lis.containsMatchingElement('Personlig info'));
  });

  it('viser ingenting hvis ingen panelfeil', () => {
    props.panelFeil = [];
    const soknadFeilmeldinger = shallow(<SoknadFeilmeldinger {...props} />);

    expect(soknadFeilmeldinger.isEmptyRender()).toBe(true);
  })
});
