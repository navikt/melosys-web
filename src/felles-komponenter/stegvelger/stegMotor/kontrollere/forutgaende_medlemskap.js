import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingForutgaendeMedlemskap from '../../stegKomponenter/vurderingForutgaendeMedlemskap';
import { erVilkarOppfylt } from '../../../../regler/vilkar';

class ForutgaendeMedlemskap extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'harForutgaendeMedlemskap ER LIK TRUE',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt('ART12_1_FORUTGAAENDE_MEDLEMSKAP', alleVilkar),
        nesteSteg: STEG.VESENTLIG_VIRKSOMHET,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this._id = STEG.FORUTGAENDE_MEDLEMSKAP;
    this._tittel = 'Forutg. medl';
    this._komponent = VurderingForutgaendeMedlemskap;
    this._samleRelevanteData = _propsLight => ({
      begrunnelser: _propsLight.begrunnelser.forutgaendeMedlemskap || [],
    });
    this._beregnRelevantUI = _propsLight => ({
      visBegrunnelser: !_propsLight.skjema.vilkar.forutgaendeMedlemskap,
    });
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      settSkjemaVerdi: this._propsLight.tilgjengeligeHandlers.settSkjemaVerdi,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default ForutgaendeMedlemskap;
