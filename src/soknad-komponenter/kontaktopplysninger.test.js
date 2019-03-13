import React from 'react';
import { KontaktOpplysninger } from './kontaktopplysninger';

describe('Kontaktopplysninger', () => {
  let props = null;

  beforeEach(() => {
    props = {
      lagreKontaktopplysninger: async () => null,
      hentOrg: async () => null,
      redigerbart: true,
      visLeggTilKnapp: true,
      toggleVisLeggTilKnapp: () => null,
      oppsummering: { saksnummer: 1 },
      representererKode: '',
      lagreAktoer: async () => null,
      hentAktoer: async () => null,
      juridiskOrg: { orgnr: '123456789' },
      renderCheckbox: () => null,
    };
  });

  describe('Dersom prop visLeggtilKnapp er true', () => {
    it('viser en knapp', () => {
      props.visLeggTilKnapp = true;
      const komponent = shallow(<KontaktOpplysninger {...props} />);
      expect(komponent.find('Knapp')).toHaveLength(1);
    });
  });

  describe('Dersom prop visLeggtilKnapp er false', () => {
    it('viser to inputfelter', () => {
      props.visLeggTilKnapp = false;
      const komponent = shallow(<KontaktOpplysninger {...props} />);
      expect(komponent.find('Input')).toHaveLength(2);
    });

    it('vis forretningsadresse, dersom søk på organisasjon ikke feilet', () => {
      props.visLeggTilKnapp = false;
      const komponent = shallow(<KontaktOpplysninger {...props} />);

      komponent.setState({
        sokeResultat: {
          orgnr: '810072512',
          navn: 'EIKEN OG TORSKEN AS',
          oppstartdato: null,
          forretningsadresse: {
            gateadresse: {
              gatenummer: null,
              husbokstav: null,
              husnummer: null,
              gatenavn: 'Nedre Skøyen vei 2',
            },
            postnr: '0276',
            poststed: 'OSLO',
            land: 'NORGE',
          },
          organisasjonsform: null,
          postadresse: {
            gateadresse: {
              gatenummer: null,
              husbokstav: null,
              husnummer: null,
              gatenavn: 'Postboks 265  Skøyen',
            },
            postnr: '0213',
            poststed: 'OSLO',
            land: 'NORGE',
          },
        },
      });

      expect(komponent.find('ForretningsAdresse')).toHaveLength(1);
    });
  });


  describe('dersom render prop renderCheckbox er oppgitt', () => {
    it('kaller render prop med validerOgLagreKontaktOgAktoer som argument', () => {
      props.visLeggTilKnapp = false;
      props.renderCheckbox = jest.fn();
      const komponent = shallow(<KontaktOpplysninger {...props} />);

      expect(props.renderCheckbox).toHaveBeenCalledTimes(1);
      expect(props.renderCheckbox.mock.calls[0][0]).toBe(komponent.instance().validerOgLagreKontaktOgAktoer);
    });
  });
});
