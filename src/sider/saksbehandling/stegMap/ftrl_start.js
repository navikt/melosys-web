import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingFtrlStart from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingFtrlStart';
import { hentFaktaListe } from '../../../regler/avklartefakta';
import * as KV from '../../../kodeverk';

class Ftrl_Start extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const harAvklaring = this.finnAvklaring(propsLight.avklartefakta, propsLight.inngangsvilkaar);
    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.FTRL_VURDERING,
      },
    ];
    this.id = STEG.FTRL_START;
    this.tittel = 'Start';
    this.komponent = VurderingFtrlStart;
    this.samleRelevanteData = _propsLight => ({
      begrunnelser: _propsLight.begrunnelser,
      alleLandkoder: _propsLight.landkoder,
      avklartefakta: _propsLight.avklartefakta,
      redigerbart: _propsLight.generiskStegRedigerbart,
      oppfyllerInngangsvilkar: _propsLight.inngangsvilkaar.oppfylt,
      inngangsvilkaar: _propsLight.inngangsvilkaar,
    });
    this.beregnRelevantUI = _propsLight => {
      const avklaring = this.finnAvklaring(_propsLight.avklartefakta, _propsLight.inngangsvilkaar);
      return ({ harAvklaring: avklaring });
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }
  finnAvklaring = (avklartefakta, inngangsvilkaar) => {
    const søknadsperiode = hentFaktaListe(KV.Koder.avklartefaktaKoder.FTRL_SOKNADSPERIODE, avklartefakta);
    const søknadsland = hentFaktaListe(KV.Koder.avklartefaktaKoder.FTRL_SOKNADSLAND, avklartefakta);
    return søknadsperiode.some(periode => periode.fakta[0] && periode.fakta[1])
       && søknadsland.some(land => land.fakta[0])
       && inngangsvilkaar.oppfylt;
  }
}
export default Ftrl_Start;
