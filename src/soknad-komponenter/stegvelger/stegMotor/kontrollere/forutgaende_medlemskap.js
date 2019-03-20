import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingForutgaendeMedlemskap from '../../stegKomponenter/vurderingForutgaendeMedlemskap';
import { erVilkarOppfylt } from '../../../../regler/vilkar';

class ForutgaendeMedlemskap extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
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
    this.id = STEG.FORUTGAENDE_MEDLEMSKAP;
    this.tittel = 'Forutg. medl';
    this.komponent = VurderingForutgaendeMedlemskap;
    this.samleRelevanteData = _propsLight => ({
      begrunnelser: _propsLight.begrunnelser.art12_1_forutgaaende_medl || [],
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const { forutgaendeMedlemskap, forutgaendeMedlemskapBegrunnelser = [] } = _propsLight.skjema.vilkar;
      const harAvklaring = forutgaendeMedlemskap === true || (forutgaendeMedlemskap === false && forutgaendeMedlemskapBegrunnelser.length > 0);

      return {
        visBegrunnelser: !forutgaendeMedlemskap,
        harAvklaring,
      };
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      settSkjemaVerdi: this._propsLight.tilgjengeligeHandlers.settSkjemaVerdi,
    };
    this.status = FANE_STATUS.OK;
  }
}

export default ForutgaendeMedlemskap;
