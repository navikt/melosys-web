import * as MKV from 'melosys-kodeverk';

import * as KV from '../../../../../../kodeverk';

import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel16Anmodning from '../../stegKomponenter/vurderingArtikkel16Anmodning';
import { hentVilkar, hentBegrunnelser } from '../../../../../../regler/vilkar';

class Artikkel16Anmodning extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'mottatt svar',
        exec: () => Artikkel16Anmodning.skalArt16SvarstegVaereSynlig(propsLight),
        nesteSteg: STEG.ARTIKKEL_16_MOTTA_SVAR,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.ARTIKKEL_16_ANMODNING;
    this.tittel = 'Artikkel 16.1';
    this.komponent = VurderingArtikkel16Anmodning;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => ({
      art16_1: hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART16_1, _propsLight.vilkar),
      harAvklaring: Artikkel16Anmodning.harAvklaring(_propsLight),
    });
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
