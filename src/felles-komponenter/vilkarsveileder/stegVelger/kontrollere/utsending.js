import Steg from '../steg';
import { FANE_STATUS, STEG } from '../../stegLogikk/typer';
import VurderingUtsending from '../../vurderinger/vurderingUtsending';
import { VurderingSysselsettingTyper } from '../../vurderinger/vurderingSysselsetting'

class Utsending extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this._id = STEG.PERIODE;
    this._komponent = VurderingUtsending;
    this._dataHenter = props => ({ });
    this._tilstand = propsLight => {
      const { faktaavklaring = {} } = propsLight;
      const { faktaavklaringSysselsettingType } = faktaavklaring;

      if (faktaavklaringSysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER) {
        return {
          visUtsendingMindreEnn24Mnd: true,
          visAnsattINorskSelskap: true,
          visErstatterTidligereUtsendt: true,
          visForetakDriverINorge: true,
          visHarForutgaendeMedlemskap: true,
          visArbeidKnyttetTilVirksomhetUtlandet: true,
          visSammeTypeVirksomhet: false,
        };
      }

      if (faktaavklaringSysselsettingType === VurderingSysselsettingTyper.SELVSTENDIG) {
        return {
          visUtsendingMindreEnn24Mnd: true,
          visAnsattINorskSelskap: false,
          visErstatterTidligereUtsendt: false,
          visForetakDriverINorge: true,
          visHarForutgaendeMedlemskap: false,
          visArbeidKnyttetTilVirksomhetUtlandet: false,
          visSammeTypeVirksomhet: true,
        };
      }

      return {};
    };
    this._handlers = {
      bekreftOgFortsett: this.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Utsending;
