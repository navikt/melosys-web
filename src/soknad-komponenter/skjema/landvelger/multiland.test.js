import React from 'react';
import { MultiLand } from './multiLand';
import { EnkeltLand } from './enkeltLand';

describe('EnkeltLand', () => {
  let props = null;

  beforeEach(() => {
    props = {
      dataListID: '1',
      landkoder: [{ kode: 'NO', term: 'Norge' }, { kode: 'SE', term: 'Sverige' }],
      meta: {},
      label: '',
      feil: undefined,
      fields: { getAll: () => null },
      disabled: false,
    };
  });

  it('viser en NAV input med riktige props', () => {
    props.disabled = true;
    props.datalistID = '999';
    props.label = 'label';

    const multiland = shallow(<MultiLand {...props} />);
    const input = multiland.find('Input');
    expect(input).toHaveLength(1);

    expect(input.props().disabled).toBe(props.disabled);
    expect(input.props().list).toBe(props.dataListID);
    expect(input.props().label).toBe(props.label);
  });

  describe('ved fokus flyttet fra input', () => {
    it('hvis tekst ikke er skrevet inn, ikke vis feilmelding', () => {
      const multiland = shallow(<MultiLand {...props} />);
      const input = multiland.find('Input');

      input.simulate('blur');

      expect(multiland.find('Input').props().feil).toBeFalsy();
    });

    it('hvis tekst er skrevet inn og landkoder prop er oppgitt: tøm feilmelding, tøm tekst-input og kall push-metoden til field prop', () => {
      props.fields.getAll = () => ['NO', 'SE'];
      const multiland = shallow(<MultiLand {...props} />);
      const input = multiland.find('Input');

      input.simulate('change', { target: { value: 'NO' } });
      input.simulate('blur');

      expect(multiland.find('Input').props().feil).toBeFalsy();
      expect(multiland.find('Input').props().value).toBe('');
    });

    it('hvis tekst er skrevet inn men land ikke finnes i landkode prop, vis feilmelding', () => {
      props.landkoder = [];
      const multiland = shallow(<MultiLand {...props} />);
      const input = multiland.find('Input');

      input.simulate('change', { target: { value: 'NO' } });
      input.simulate('blur');

      expect(multiland.find('Input').props().feil).toBeTruthy();
    });


  });
});
