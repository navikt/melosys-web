import React from 'react';

import { DialogboksHenleggSak } from './dialogboksHenlegg';

describe('Dialogbokshenlegg', () => {
  let props = null;

  beforeEach(() => {
    props = {
      avbryt: jest.fn(),
      oppsummering: { behandlingID: 1 },
      redigerbart: true,
      henleggHandle: jest.fn(),
    };
  });

  it('viser en Nav Modal', () => {
    const komponent = mount(<DialogboksHenleggSak {...props} />);
    expect(komponent.exists('Modal')).toBe(true);
  });

  describe('Modal', () => {
    const komponent = shallow(<DialogboksHenleggSak {...props} />);
    it('viser en dropdownliste', () => {
      expect(komponent.exists('kodeTermSelect')).toBe(true);
    });
    it('viser en pdflenkeliste', () => {
      expect(komponent.exists('PdfLenkeListe')).toBe(true);
    });
  });
});
