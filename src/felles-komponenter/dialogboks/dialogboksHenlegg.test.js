import React from 'react';

import { DialogboksHenleggSak } from './dialogboksHenlegg';

describe('Dialogbokshenlegg', () => {
  let props = null;

  const avbryt = jest.fn();
  const henleggHandle = jest.fn();

  beforeEach(() => {
    props = {
      avbryt,
      oppsummering: { behandlingID: 1 },
      redigerbart: true,
      henleggHandle,
      ariaHideApp: false,
    };
  });

  it('viser en Nav Modal', () => {
    const komponent = mount(<DialogboksHenleggSak {...props} />);
    expect(komponent.exists('Modal')).toBe(true);
  });

  describe('Modal', () => {
    it('viser en dropdownliste', () => {
      const komponent = shallow(<DialogboksHenleggSak {...props} />);
      expect(komponent.exists('kodeTermSelect')).toBe(true);
    });
    it('viser en pdflenkeliste', () => {
      const komponent = shallow(<DialogboksHenleggSak {...props} />);
      expect(komponent.exists('PdfLenkeListe')).toBe(true);
    });
  });

  it('viser en Nav Knapp for avbryting av dialog', () => {
    const komponent = mount(<DialogboksHenleggSak {...props} />);
    expect(komponent.exists('Knapp')).toBe(true);
  });

  describe('Avbryt knapp', () => {
    it('avbryter dialogen', () => {
      const komponent = mount(<DialogboksHenleggSak {...props} />);
      const avbrytKnapp = komponent.find('Knapp');
      avbrytKnapp.simulate('click');
      expect(props.avbryt).toHaveBeenCalled();
    });
  });

  it('viser en Nav Hovedknapp for henlegging av sak', () => {
    const komponent = mount(<DialogboksHenleggSak {...props} />);
    expect(komponent.exists('Knapp')).toBe(true);
  });
});

