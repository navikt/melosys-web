import StegMotor from './index';

describe('Tester stegVelger', () => {
  test('stegvelger', () => {
    const avklartefakta = {
      behandlingID: 4,
      avklaring: {
        opphold: {
          land: ['GB'],
          periode: {
            fom: '2018-01-01',
            tom: '2019-01-01',
          },
        },
        aktivitet: {
          aktivitetLand: ['GB'],
        },
        yrkesgruppe: {
          yrkesgruppeType: 'ARBEIDSTAKER',
        },
        utsending: {
          ansattINorskSelskap: true,
          erstatterTidligereUtsendt: true,
          utsendingMindreEnn24Mnd: null,
          foretakDriverINorge: true,
          harForutgaendeMedlemskap: true,
          arbeidKnyttetTilVirksomhetUtlandet: null,
          sammeTypeVirksomhet: null,
        },
        bosted: {
          vurdering: {},
          land: [],
        },
        yrkesaktivitet: {
          yrkesaktivitetType: 'INGEN_AV_DISSE',
        },
        tjenestemann: {
          tjenestemann: 'ETT_LAND_YRKESAKTIVITET_ANDRE_LAND',
        },
        valgteArbeidsforhold: [],
        yrkesaktivitetAntallLand: {
          antallLand: 'ETT_LAND_IKKE_NORGE',
        },
        virksomhet: {
          aktivitetINorge: 'OVER_25_PROSENT',
          marginaltArbeid: 'MARGINALT_JA',
          vekslingMellomLand: 'EN_ELLER_BEGGE',
        },
      },
    };

    const _stegvelger = new StegMotor(avklartefakta);

    expect(typeof StegMotor).toBe('function');
  });
});
