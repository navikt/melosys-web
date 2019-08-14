import React from 'react';

import { AdresseHeader, AdresseRad, ExpandableTable } from './personopplysninger';

describe('AdresseRad', () => {
  const props = {
    periode: {
      fom: '2014-12-11T16:30:01.622Z',
      tom: '2015-12-11T16:30:01.622Z',
    },
    adresseKomponent: {},
  };

  it('viser en tabellrad', () => {
    const adresseRad = shallow(<AdresseRad {...props} />);

    expect(adresseRad.first().is('tr')).toBe(true);
  });

  it('viser verdier fra props', () => {
    const adresseRad = shallow(<AdresseRad {...props} />);

    expect(adresseRad.find('td').contains('11.12.2014')).toBe(true);
    expect(adresseRad.find('td').contains('11.12.2015')).toBe(true);
  });
});

describe('AdresseHeader', () => {
  const props = {
    adresseTittel: 'Bostedsadresse',
  };

  it('viser en adresseheader', () => {
    const adresseHeader = shallow(<AdresseHeader {...props} />);

    expect(adresseHeader.first().is('thead')).toBe(true);
  });

  it('viser verdier fra props', () => {
    const adresseHeader = shallow(<AdresseHeader {...props} />);

    expect(adresseHeader.find('th').contains(props.adresseTittel)).toBe(true);
  });
});

describe('ExpandableTable', () => {
  let props = null;

  beforeEach(() => {
    props = {
      renderElement: jest.fn(() => <span />),
      elements: [],
      header: '',
      defaultMax: 2,
      altMax: 10,
      btnTextExpanded: 'vis mindre',
      btnTextCollapsed: 'vis flere',
      chevron: true,
      expandable: true,
    };
  });

  it('viser elementer', () => {
    shallow(<ExpandableTable {...props} />);

    expect(props.renderElement).toHaveBeenCalledTimes(props.elements.length);
  });

  it('viser en knapp med tekst og chevron', () => {
    const expandableList = shallow(<ExpandableTable {...props} />);

    expect(expandableList.exists('button')).toBe(true);
    expect(expandableList.find('button').contains(props.btnTextCollapsed)).toBe(true);
    expect(expandableList.find('NavFrontendChevron')).toHaveLength(1);
  });
});
