import React from 'react';

import { Sok } from './sok';
import SorterbarListe from '../../felleskomponenter/sorterbarListe/sorterbarListe';

describe('Sok', () => {
  let props = null;

  const getItemPrototype = Storage.prototype.getItem;
  Storage.prototype.getItem = jest.fn(() => 'MEL-999999999999999999999');

  beforeEach(() => {
    props = {
      sokResultat: [{}],
      sok: jest.fn(),
    };
  });

  afterAll(() => {
    Storage.prototype.getItem = getItemPrototype;
  });

  it('viser en sorterbarliste ved treff på søk', () => {
    const sok = shallow(<Sok {...props} />);

    const sorterbarListe = sok.find(SorterbarListe);
    const sorterbarListeProps = sorterbarListe.props();

    expect(sorterbarListe).toHaveLength(1);
    expect(sorterbarListeProps.elementer).toBe(props.sokResultat);
  });
});
