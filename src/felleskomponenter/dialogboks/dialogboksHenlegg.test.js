import React from 'react';

import * as Nav from '../../utils/navFrontend';

import { DialogboksHenleggSak } from './dialogboksHenlegg';
import Knapperad from '../knapperad';
import { KodeTermSelect } from '../ui/kodeTermSelect';
import PdfLenkeListe from '../pdfLenkeListe';

describe('Dialogbokshenlegg', () => {
  let props = null;

  const avbryt = jest.fn();
  const henleggHandle = jest.fn();

  beforeEach(() => {
    props = {
      avbryt,
      behandlingID: 1,
      redigerbart: true,
      henleggHandle,
      ariaHideApp: false,
    };
  });

  it('viser en Nav Modal', () => {
    const komponent = shallow(<DialogboksHenleggSak {...props} />);
    expect(komponent.exists(Nav.Modal)).toBe(true);
  });

  describe('Modal', () => {
    it('viser en dropdownliste', () => {
      const komponent = shallow(<DialogboksHenleggSak {...props} />);
      expect(komponent.exists(KodeTermSelect)).toBe(true);
    });

    it('viser en pdflenkeliste', () => {
      const komponent = shallow(<DialogboksHenleggSak {...props} />);
      expect(komponent.exists(PdfLenkeListe)).toBe(true);
    });

    it('viser en Knapperad', () => {
      props.redigerbart = false;
      const komponent = shallow(<DialogboksHenleggSak {...props} />);

      expect(komponent.find(Knapperad).props().redigerbart).toBe(props.redigerbart);
      expect(komponent.find(Knapperad).props().avbryt).toBe(props.avbryt);
    });
  });
});

