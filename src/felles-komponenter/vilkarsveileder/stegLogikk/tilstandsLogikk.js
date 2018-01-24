class TilstandsLogikk {
  static beregnTilstand = (gjeldendeSteg, faktaavklaring) => {
    switch (gjeldendeSteg) {
      case 'PERIODE': {
        return 'SYSSELSETTING';
      }
      case 'SYSSELSETTING': {
        return {
          faktaavklaringSysselsettingType: true,
        };
      }
      case 'SEKTOR': {
        return {
          faktaavklaringAnsattISektor: true,
        };
      }
      case 'VIRKSOMHET': {
        return {
          faktaavklaringAntallLand: true,
          faktaavklaringVekslingMellomLand: true,
          faktaavklaringMarginaltArbeid: true,
          faktaavklaringAktivitetINorge: true,
        };
      }
      case 'UTSENDING': {
        return 'VEDTAK';
      }
      case 'AKTIVITET': {
        return 'VEDTAK';
      }
      case 'ARBEIDSFORHOLD': {
        return 'VEDTAK';
      }
      default:
        return 'FEIL';
    }
  }
}

export default TilstandsLogikk;
