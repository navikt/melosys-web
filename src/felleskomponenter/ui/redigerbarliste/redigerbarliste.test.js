import React from 'react';

import RedigerbarListe from './redigerbarliste';
import Element from './element';

describe('Redigerbarliste', () => {
  let props = null;

  beforeEach(() => {
    props = {
      elementer: [
        {
          kode: 'kode',
          term: 'term',
          fjernbar: true,
          defaultFjernet: false,
        },
        {
          kode: 'kode',
          term: 'term',
          fjernbar: false,
          defaultFjernet: false,
        },
      ],
      onFjern: jest.fn(),
      onAngreFjern: jest.fn(),
      redigerbar: true,
    };
  });

  it('viser en liste med elementer', () => {
    const redigerbarliste = shallow(<RedigerbarListe {...props} />);

    const elementer = redigerbarliste.find(Element);
    expect(elementer).toHaveLength(2);

    expect(elementer.at(0).props()).toMatchObject({
      kode: 'kode',
      term: 'term',
      fjernbar: true,
      defaultFjernet: false,
      redigerbar: true,
      onFjern: props.onFjern,
      onAngreFjern: props.onAngreFjern,
    });
    expect(elementer.at(1).props()).toMatchObject({
      kode: 'kode',
      term: 'term',
      fjernbar: false,
      defaultFjernet: false,
      redigerbar: true,
      onFjern: props.onFjern,
      onAngreFjern: props.onAngreFjern,
    });
  });
});
