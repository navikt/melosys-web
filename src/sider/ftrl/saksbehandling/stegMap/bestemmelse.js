import Steg from '../../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingBestemmelse from '../../../../felleskomponenter/stegvelger/stegKomponenter/ftrl/vurderingBestemmelse';

class Bestemmelse extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const { bestemmelser, medlemskapsperioder, vilkar } = propsLight;
    const harAvklaring = this.finnAvklaring(bestemmelser, medlemskapsperioder, vilkar);
    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.PERIODER,
      },
    ];
    this.id = STEG.BESTEMMELSE;
    this.tittel = 'Bestemmelse';
    this.komponent = VurderingBestemmelse;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.redigerbart,
      vilkar: _propsLight.vilkar,
      bestemmelseVilkår: _propsLight.bestemmelser,
    });
    this.beregnRelevantUI = _propsLight => ({ harAvklaring });
    this.handlers = {
      bekreft: propsLight.tilgjengeligeHandlers.bekreft,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      oppdater: propsLight.tilgjengeligeHandlers.oppdater,
      lagreVilkar: propsLight.tilgjengeligeHandlers.lagreVilkar,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
    };
    this.status = FANE_STATUS.OK;
  }
  finnAvklaring(bestemmelser, medlemskapsperioder, vilkar){
    const valgteBestemmelseVilkår = bestemmelser && bestemmelser.find(bestemmelseVilkår => bestemmelseVilkår.bestemmelse === medlemskapsperioder.bestemmelse);
    const erAlleVilkårUtfyltOgBegrunnelseValgt = valgteBestemmelseVilkår && valgteBestemmelseVilkår.vilkårOgBegrunnelser.filter(vilkårOgBegrunnelse =>
      vilkar.find(lagretVilkar => (lagretVilkar.oppfylt && lagretVilkar.vilkaar === vilkårOgBegrunnelse.vilkaar) && (vilkårOgBegrunnelse.muligeBegrunnelser.length > 0 ? (lagretVilkar.begrunnelseKoder.length > 0) : true)))
      .length === valgteBestemmelseVilkår.vilkårOgBegrunnelser.length;
    return !!erAlleVilkårUtfyltOgBegrunnelseValgt;
  }
}
export default Bestemmelse;
