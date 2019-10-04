import React from 'react';

import { FaneViser } from './sideDialog';

import SideDialogDokumenter from './sideDialogDokumenter';
import SideDialogBrevBestillilng from './brevBestilling';
import SideDialogSedBestilling from './sedBestilling';
import SideDialogBesvarSed from './sideDialogBesvarSed';

describe('SideDialog', () => {
  describe('FaneViser', () => {
    let props = null;

    beforeEach(() => {
      props = {
        navn: 'abc',
        behandlingID: 4,
        saksnummer: '4',
        brevBestillingRedigerbartIArtikkel13: false,
        brevBestillingRedigerbart: false,
      };
    });

    describe('Navn-prop styrer visning av', () => {
      it('SideDialogDokumenter', () => {
        props.navn = 'dokumenter';
        const faner = shallow(<FaneViser {...props} />);

        const sideDialogDokumenter = faner.find(SideDialogDokumenter);
        expect(sideDialogDokumenter).toHaveLength(1);
        expect(sideDialogDokumenter.props().saksnummer).toBe(props.saksnummer);
      });

      it('SideDialogBrevBestillilng', () => {
        props.navn = 'brevbestilling';
        const faner = shallow(<FaneViser {...props} />);

        const sideDialogBrevBestilling = faner.find(SideDialogBrevBestillilng);
        const childProps = sideDialogBrevBestilling.props();

        expect(sideDialogBrevBestilling).toHaveLength(1);
        expect(childProps.behandlingID).toBe(props.behandlingID);
        expect(childProps.redigerbart).toBe(props.brevBestillingRedigerbart);
        expect(childProps.brevBestillingRedigerbartIArtikkel13).toBe(props.brevBestillingRedigerbartIArtikkel13);
      });

      it('SideDialogSedBestilling', () => {
        props.navn = 'sedbestilling';
        const faner = shallow(<FaneViser {...props} />);

        const sideDialogSedBestilling = faner.find(SideDialogSedBestilling);
        expect(sideDialogSedBestilling).toHaveLength(1);
        expect(sideDialogSedBestilling.props().behandlingID).toBe(props.behandlingID);
      });

      it('SideDialogBesvarSed', () => {
        props.navn = 'besvarsed';
        const faner = shallow(<FaneViser {...props} />);

        const sideDialogBesvarSed = faner.find(SideDialogBesvarSed);
        expect(sideDialogBesvarSed).toHaveLength(1);
        expect(sideDialogBesvarSed.props().behandlingID).toBe(props.behandlingID);
      });
    });

    it('Throw error hvis navn-prop ikke oppgitt', () => {
      delete props.navn;
      expect(() => {
        shallow(<FaneViser {...props} />);
      }).toThrow();
    });
  });
});
