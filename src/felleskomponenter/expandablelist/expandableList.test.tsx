import React from 'react';
import { shallow } from 'enzyme';

import ExpandableList from './index';

describe('ExpandableList', () => {
  it('viser elementer', () => {
    const renderElement = jest.fn(element => <span>{element}</span>);
    const expandableList = shallow(<ExpandableList
      renderElement={renderElement}
      elements={['e1', 'e2']}
      idFromElement={element => element}
      header="Tittel"
      amountOfItemsCollapsed={2}
      btnTextExpanded="vis mindre"
      btnTextCollapsed="vis flere"
      chevron
    />);

    expect(expandableList.contains('e1')).toBe(true);
    expect(expandableList.contains('e2')).toBe(true);
  });

  it('viser en knapp med tekst og chevron', () => {
    const expandableList = shallow(<ExpandableList
      renderElement={jest.fn(() => <span />)}
      elements={['hei', 'hei2', 'hei3']}
      idFromElement={element => element}
      header="Tittel"
      amountOfItemsCollapsed={2}
      btnTextExpanded="vis mindre"
      btnTextCollapsed="vis flere"
      chevron
    />);

    expect(expandableList.exists('button')).toBe(true);
    expect(expandableList.find('button').contains('vis flere')).toBe(true);
    expect(expandableList.find('NavFrontendChevron')).toHaveLength(1);
  });
});
