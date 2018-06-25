import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingUtsending from '../../vurderinger/vurderingUtsending';
import { VurderingSysselsettingTyper } from '../../vurderinger/vurderingSysselsetting';

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
    this._id = STEG.UTSENDING;
    this._tittel = 'Utsending';
    this._komponent = VurderingUtsending;
    this._dataHenter = () => ({ });
    this._tilstand = _propsLight => {
      const { faktaavklaring = {} } = _propsLight;
      const { sysselsetting: { sysselsettingType } = {} } = faktaavklaring;

      if (sysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER) {
        return {
          visUtsendingMindreEnn24Mnd: true,
          visAnsattINorskSelskap: true,
          visErstatterTidligereUtsendt: true,
          visForetakDriverINorge: true,
          visHarForutgaendeMedlemskap: true,
          visSammeTypeVirksomhet: false,
        };
      }

      if (sysselsettingType === VurderingSysselsettingTyper.SELVSTENDIG) {
        return {
          visUtsendingMindreEnn24Mnd: true,
          visAnsattINorskSelskap: false,
          visErstatterTidligereUtsendt: false,
          visForetakDriverINorge: true,
          visHarForutgaendeMedlemskap: false,
          visSammeTypeVirksomhet: true,
        };
      }

      return {};
    };
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Utsending;
