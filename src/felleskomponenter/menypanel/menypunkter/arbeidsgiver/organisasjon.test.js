import React from 'react';

import Organisasjon from './organisasjon';
import OrganisasjonsAdresse from '../../../adresser/organisasjonsAdresse';
import KontaktOpplysninger from '../../../kontaktopplysninger';

describe('organisasjon', () => {
  let props = null;

  beforeEach(() => {
    props = {
      organisasjon: {},
      redigerbart: true,
    };
  });

  it('viser organisasjonsadresse', () => {
    const organisasjon = shallow(<Organisasjon {...props} />);
    const organisasjonsAdresse = organisasjon.find(OrganisasjonsAdresse);

    expect(organisasjonsAdresse).toHaveLength(1);
    expect(organisasjonsAdresse.props().organisasjon).toBe(props.organisasjon);
  });

  it('viser kontaktopplysninger', () => {
    const organisasjon = shallow(<Organisasjon {...props} />);
    const kontaktopplysninger = organisasjon.find(KontaktOpplysninger);
    const kontaktopplysningerProps = kontaktopplysninger.props();

    expect(kontaktopplysninger).toHaveLength(1);
    expect(kontaktopplysningerProps.redigerbart).toBe(props.redigerbart);
    expect(kontaktopplysningerProps.juridiskOrg).toBe(props.organisasjon);
  });
});
