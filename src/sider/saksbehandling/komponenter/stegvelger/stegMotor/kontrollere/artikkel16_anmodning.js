import * as MKV from 'melosys-kodeverk';

import * as KV from '../../../../../../kodeverk';

import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel16Anmodning from '../../stegKomponenter/vurderingArtikkel16Anmodning';
import { hentVilkar } from '../../../../../../regler/vilkar';

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
      redigerbart: _propsLight.redigerbart,
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
    return Artikkel16Anmodning.erUnderBehandlingEllerAvsluttet(propsLight) && Artikkel16Anmodning.harAvklaring(propsLight);
  }

  static erUnderBehandlingEllerAvsluttet({ behandlingsstatus }) {
    return [
      MKV.Koder.behandlinger.status.UNDER_BEHANDLING,
      MKV.Koder.behandlinger.status.AVSLUTTET,
    ].includes(KV.objektTilKode(behandlingsstatus));
  }

  static harAvklaring({ anmodningsperioder }) {
    return (
      anmodningsperioder.length > 0 &&
      anmodningsperioder.every(anmodningsperiode => anmodningsperiode.sendtUtland)
    );
  }
}

export default Artikkel16Anmodning;
