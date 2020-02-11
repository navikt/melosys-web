import React from 'react';

import { CustomRadioPanelElement } from './customRadioPanelGruppe';

import * as Nav from '../../../utils/navFrontend';

describe('CustomRadioPanelElement', () => {
  let props = null;

  beforeEach(() => {
    props = {
      tittel: 'test',
      data: [
        {
          term: 'term',
          description: 'description',
        },
        {
          term: 'term',
          description: 'description',
        },
      ],
    };
  });

  it('viser en liste med terms og descriptions', () => {
    const customRadioPanelElement = shallow(<CustomRadioPanelElement {...props} />);

    expect(customRadioPanelElement.find('dt')).toHaveLength(props.data.length);
    expect(customRadioPanelElement.find('dd')).toHaveLength(props.data.length);
  });

  it('viser ikke elementer i listen som mangler description', () => {
    props.data = [
      {
        term: 'term',
        description: 'description',
      },
      {
        term: 'term',
      },
    ];

    const customRadioPanelElement = shallow(<CustomRadioPanelElement {...props} />);

    expect(customRadioPanelElement.find('dt')).toHaveLength(props.data.length - 1);
    expect(customRadioPanelElement.find('dd')).toHaveLength(props.data.length - 1);
  });

  it('viser tittel', () => {
    const customRadioPanelElement = shallow(<CustomRadioPanelElement {...props} />);

    expect(customRadioPanelElement.find(Nav.typo.Undertittel)).toHaveLength(1);
    expect(customRadioPanelElement.find(Nav.typo.Undertittel).children().text()).toBe(props.tittel);
  });
});
