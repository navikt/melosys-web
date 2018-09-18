import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingForutgaendeMedlemskap from '../../vurderinger/vurderingForutgaendeMedlemskap';

class ForutgaendeMedlemskap extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VESENTLIG_VIRKSOMHET,
      },
    ];
    this._id = STEG.FORUTGAENDE_MEDLEMSKAP;
    this._tittel = 'Forutgående Medlemskap';
    this._komponent = VurderingForutgaendeMedlemskap;
    this._samleRelevanteData = _propsLight => ({
      begrunnelser: _propsLight.begrunnelser.forutgaendeMedlemskap || [],
    });
    this._beregnRelevantUI = () => ({});
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default ForutgaendeMedlemskap;
