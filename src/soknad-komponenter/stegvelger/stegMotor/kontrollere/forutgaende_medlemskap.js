import * as MKV from 'melosys-kodeverk';
import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingForutgaendeMedlemskap from '../../stegKomponenter/vurderingForutgaendeMedlemskap';
import { erVilkarOppfylt, hentVilkar } from '../../../../regler/vilkar';

class ForutgaendeMedlemskap extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'harForutgaendeMedlemskap ER LIK TRUE',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(MKV.Koder.vilkaar.ART12_1_FORUTGAAENDE_MEDLEMSKAP, alleVilkar) !== undefined,
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
      begrunnelser: _propsLight.begrunnelser.art12_1_forutgaaende_medl,
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const forutgaendeMedlemskap = hentVilkar(MKV.Koder.vilkaar.ART12_1_FORUTGAAENDE_MEDLEMSKAP, _propsLight.vilkar);
      const harAvklaring = forutgaendeMedlemskap.oppfylt === true || (forutgaendeMedlemskap.oppfylt === false && forutgaendeMedlemskap.begrunnelseKoder.length > 0);

      return {
        visBegrunnelser: !forutgaendeMedlemskap.oppfylt,
        forutgaendeMedlemskap,
        harAvklaring,
      };
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      settSkjemaVerdi: this._propsLight.tilgjengeligeHandlers.settSkjemaVerdi,
      oppdaterRessurs: (felt, innhold) => this._propsLight.tilgjengeligeHandlers.oppdaterStegressurs(this.id, felt, innhold),
      slettAllStegdata: () => this._propsLight.tilgjengeligeHandlers.slettAllStegdata(this.id),
    };
    this.status = FANE_STATUS.OK;
  }
}

export default ForutgaendeMedlemskap;
