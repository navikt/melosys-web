import MKV from '../../../melosyskodeverk';

import * as KV from '../../../kodeverk';

import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingArtikkel16Anmodning from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingArtikkel16Anmodning';
import { hentVilkar, hentBegrunnelser } from '../../../regler/vilkar';

class Artikkel16Anmodning extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'mottatt svar',
        exec: () => Artikkel16Anmodning.skalArt16SvarstegVaereSynlig(propsLight),
        nesteSteg: STEG.ARTIKKEL_16_MOTTA_SVAR,
      },
    ];
    this.id = STEG.ARTIKKEL_16_ANMODNING;
    this.tittel = 'Artikkel 16.1';
    this.komponent = VurderingArtikkel16Anmodning;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const muligeBegrunnelseValg = _propsLight.erIDirekteTilArtikkel16Flyt ? MKV.KTObjects.begrunnelser.art16_1_anmodning_uten_art12 : MKV.KTObjects.begrunnelser.art16_1_anmodning;

      return {
        muligeBegrunnelseValg,
        erIDirekteTilArtikkel16Flyt: _propsLight.erIDirekteTilArtikkel16Flyt,
        art16_1: hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART16_1, _propsLight.vilkar),
        harAvklaring: Artikkel16Anmodning.harAvklaring(_propsLight),
      };
    };
    this.handlers = {
      lagreOgBestillAnmodningsperioder: this._propsLight.tilgjengeligeHandlers.lagreOgBestillAnmodningsperioder,
      byggAnmodningsperioderHandler: this._propsLight.tilgjengeligeHandlers.byggAnmodningsperioderHandler,
      oppdaterOgLagreBehandlinger: this._propsLight.tilgjengeligeHandlers.oppdaterOgLagreBehandlinger,
      lagreVilkarHandler: this._propsLight.tilgjengeligeHandlers.lagreVilkarHandler,
      lagreAnmodningsperioderHandler: this._propsLight.tilgjengeligeHandlers.lagreAnmodningsperioderHandler,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }

  static skalArt16SvarstegVaereSynlig(propsLight) {
    return this.erUnderBehandlingEllerAvsluttet(propsLight) && this.anmodningErSendtUtland(propsLight);
  }

  static erUnderBehandlingEllerAvsluttet({ behandlingsstatus }) {
    return [
      MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
      MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET,
    ].includes(KV.objektTilKode(behandlingsstatus));
  }

  static anmodningErSendtUtland({ anmodningsperioder }) {
    return (
      anmodningsperioder.length > 0 &&
      anmodningsperioder.every(anmodningsperiode => anmodningsperiode.sendtUtland)
    );
  }

  static harAvklaring({ anmodningsperioder, vilkar }) {
    const unntakFraBestemmelseErSatt = anmodningsperioder.some(anmodningsperiode => anmodningsperiode.unntakFraBestemmelse);
    const minstEnBegrunnelseErValgt = hentBegrunnelser(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1, vilkar).length > 0;

    return unntakFraBestemmelseErSatt && minstEnBegrunnelseErValgt;
  }
}

export default Artikkel16Anmodning;
