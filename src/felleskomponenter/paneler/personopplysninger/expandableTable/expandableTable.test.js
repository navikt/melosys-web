import React from 'react';

import ExpandableTable from './index';

describe('ExpandableTable', () => {
  let props = null;

  beforeEach(() => {
    props = {
      renderElement: jest.fn(() => <span />),
      elements: [],
      header: '',
      amountOfItemsCollapsed: 1,
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
    const expandableTable = shallow(<ExpandableTable {...props} />);

    expect(expandableTable.exists('button')).toBe(true);
    expect(expandableTable.find('button').contains(props.btnTextCollapsed)).toBe(true);
    expect(expandableTable.find('NavFrontendChevron')).toHaveLength(1);
  });
});
