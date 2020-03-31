import MKV from '../../../melosyskodeverk';
import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingForutgaendeMedlemskap from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingForutgaendeMedlemskap';
import { hentVilkar } from '../../../regler/vilkar';

class ForutgaendeMedlemskap extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const forutgaendeMedlemskap = hentVilkar(MKV.Koder.vilkaar.ART12_1_FORUTGAAENDE_MEDLEMSKAP, propsLight.vilkar);
    const harAvklaring = forutgaendeMedlemskap.oppfylt === true || (forutgaendeMedlemskap.oppfylt === false && forutgaendeMedlemskap.begrunnelseKoder.length > 0);

    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.VESENTLIG_VIRKSOMHET,
      },
    ];
    this.id = STEG.FORUTGAENDE_MEDLEMSKAP;
    this.tittel = 'Forutg. medl.';
    this.komponent = VurderingForutgaendeMedlemskap;
    this.samleRelevanteData = _propsLight => ({
      begrunnelser: _propsLight.begrunnelser.art12_1_forutgaaende_medl,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => ({
      visBegrunnelser: !forutgaendeMedlemskap.oppfylt,
      forutgaendeMedlemskap,
      harAvklaring,
    });
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, innhold) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, innhold),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }
}

export default ForutgaendeMedlemskap;
