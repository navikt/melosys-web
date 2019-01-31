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
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt('ART12_1_FORUTGAAENDE_MEDLEMSKAP', alleVilkar) !== undefined,
        nesteSteg: STEG.VESENTLIG_VIRKSOMHET,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this._id = STEG.FORUTGAENDE_MEDLEMSKAP;
    this._tittel = 'Forutg. medl';
    this._komponent = VurderingForutgaendeMedlemskap;
    this._samleRelevanteData = _propsLight => ({
      begrunnelser: _propsLight.begrunnelser.art12_1_forutgaaende_medl || [],
      redigerbart: _propsLight.redigerbart,
    });
    this._beregnRelevantUI = _propsLight => {
      const { forutgaendeMedlemskap, forutgaendeMedlemskapBegrunnelser = [] } = _propsLight.skjema.vilkar;
      const harAvklaring = forutgaendeMedlemskap === true || (forutgaendeMedlemskap === false && forutgaendeMedlemskapBegrunnelser.length > 0);

      return {
        visBegrunnelser: !forutgaendeMedlemskap,
        harAvklaring,
      };
    };
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      settSkjemaVerdi: this._propsLight.tilgjengeligeHandlers.settSkjemaVerdi,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default ForutgaendeMedlemskap;
