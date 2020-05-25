import React from 'react';

import * as Mui from '../../../felleskomponenter/ui';

import { Personopplysninger, AdresseHeader, AdresseRad } from './personopplysninger';
import ExpandableTable from './expandableTable';
import PersonInfo from '../../personInfo';
import UtenlandskIdent from './utenlandskIdent';
import OppgittAdresseSoknad from './oppgittAdresseSoknad';
import Medlemskap from './medlemskap';

describe('Personopplysninger', () => {
  let props = null;

  beforeEach(() => {
    props = {
      oppgittAdresseHarVerdier: true,
      redigerbart: true,
      person: {
        sammensattNavn: 'HATT',
        personStatus: {
          kode: 'I_LIVE',
          term: 'Lever',
        },
        erEgenAnsatt: true,
      },
      personhistorikk: {
        bostedsadressePerioder: [
          {
            bostedsadresse: {
              gateadresse: {
                gatenavn: 'Tysklandsgate',
                gatenummer: 14,
                husnummer: 20,
                husbokstav: 'A',
              },
              postnr: '1111',
              poststed: 'Berlin',
              land: 'DE',
            },
            periode: {
              fom: '12.12.2012',
              tom: '13.12.2013',
            },
          },
        ],
        postadressePerioder: [
          {
            postadresse: {
              landkode: 'PL',
              adresselinjer: ['Polandgata 1111'],
            },
            periode: {
              fom: '12.12.2012',
              tom: '13.12.2013',
            },
          },
        ],
        midlertidigAdressePerioder: [
          {
            midlertidigAdresse: {
              adressetype: 'ustrukturert',
              strukturertAdresse: null,
              UstrukturertAdresse: {
                landkode: 'PL',
                adresselinjer: ['Polandgata 1111'],
              },
            },
            periode: {
              fom: '12.12.2012',
              tom: '13.12.2013',
            },
          },
        ],
      },
      medlemskap: {},
    };
  });

  it('viser undertittel med søkers navn', () => {
    const personopplysninger = shallow(<Personopplysninger {...props} />);
    const undertittel = personopplysninger
      .findWhere(n => n.type() === Mui.Undertittel && n.props().tekst === props.person.sammensattNavn);

    expect(undertittel).toHaveLength(1);
  });

  it('viser PersonInfo', () => {
    const personopplysninger = shallow(<Personopplysninger {...props} />);
    const personInfo = personopplysninger.find(PersonInfo);

    expect(personInfo).toHaveLength(1);
    expect(personInfo.props().person).toBe(props.person);
  });

  it('viser utenlandsk ident', () => {
    const personopplysninger = shallow(<Personopplysninger {...props} />);
    const utenlandskIdent = personopplysninger.find(UtenlandskIdent);

    expect(utenlandskIdent).toHaveLength(1);
    expect(utenlandskIdent.props().disabled).toBe(!props.redigerbart);
  });

  it('viser expandableTable for bostedsadresse-, postadresse- og midlertidig adresse perioder', () => {
    const personopplysninger = shallow(<Personopplysninger {...props} />);
    const expandableTables = personopplysninger.find(ExpandableTable);

    expect(expandableTables.first().props().elements).toBe(props.personhistorikk.bostedsadressePerioder);
    expect(expandableTables.at(1).props().elements).toBe(props.personhistorikk.postadressePerioder);
    expect(expandableTables.last().props().elements).toBe(props.personhistorikk.midlertidigAdressePerioder);
  });

  it('viser oppgittadressesoknad dersom oppgitt adresse har verdier', () => {
    props.oppgittAdresseHarVerdier = true;
    const personopplysninger = shallow(<Personopplysninger {...props} />);
    const oppgittAdresseSoknad = personopplysninger.find(OppgittAdresseSoknad);

    expect(oppgittAdresseSoknad).toHaveLength(1);
    expect(oppgittAdresseSoknad.props().redigerbart).toBe(props.redigerbart);
  });

  it('viser ikke oppgittadressesoknad dersom oppgitt adresse ikke har verdier', () => {
    props.oppgittAdresseHarVerdier = false;
    const personopplysninger = shallow(<Personopplysninger {...props} />);
    const oppgittAdresseSoknad = personopplysninger.find(OppgittAdresseSoknad);

    expect(oppgittAdresseSoknad).toHaveLength(0);
  });

  it('viser oppgittadressesoknad ved klikk på knapp for å legge til oppgitt adressse', () => {
    props.oppgittAdresseHarVerdier = false;
    const personopplysninger = shallow(<Personopplysninger {...props} />);

    const knapp = personopplysninger
      .findWhere(n => n.type() === Mui.Knapp && n.containsMatchingElement('LEGG TIL ADRESSE'));
    expect(knapp).toHaveLength(1);
    expect(knapp.props().disabled).toBe(!props.redigerbart);
    knapp.simulate('click');

    const oppgittAdresseSoknad = personopplysninger.find(OppgittAdresseSoknad);
    expect(oppgittAdresseSoknad).toHaveLength(1);
  });

  it('viser medlemskap', () => {
    const personopplysninger = shallow(<Personopplysninger {...props} />);
    const medlemskap = personopplysninger.find(Medlemskap);

    expect(medlemskap).toHaveLength(1);
    expect(medlemskap.props().medlemskap).toBe(props.medlemskap);
  });
});

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
