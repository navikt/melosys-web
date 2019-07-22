import * as MKV from 'melosys-kodeverk';

import * as KV from '../../../../kodeverk';

import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel16 from '../../stegKomponenter/vurderingArtikkel16';
import { hentVilkar } from '../../../../regler/vilkar';

class Artikkel16 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'mottatt svar',
        exec: () => Artikkel16.harAvklaring(propsLight),
        nesteSteg: STEG.ARTIKKEL_16_MOTTA_SVAR,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.ARTIKKEL_16;
    this.tittel = 'Artikkel 16.1';
    this.komponent = VurderingArtikkel16;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => ({
      art16_1: hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART16_1, _propsLight.vilkar),
      harAvklaring: Artikkel16.harAvklaring(_propsLight),
    });
    this.handlers = {
      lagreOgStartAnmodningSaksflyt: this._propsLight.tilgjengeligeHandlers.lagreOgStartAnmodningSaksflyt,
      byggAnmodningsperioderHandler: this._propsLight.tilgjengeligeHandlers.byggAnmodningsperioderHandler,
      oppdaterOgLagreBehandlinger: this._propsLight.tilgjengeligeHandlers.oppdaterOgLagreBehandlinger,
      lagreVilkarHandler: this._propsLight.tilgjengeligeHandlers.lagreVilkarHandler,
      lagreAnmodningsperioderHandler: this._propsLight.tilgjengeligeHandlers.lagreAnmodningsperioderHandler,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }

  static harAvklaring({ anmodningsperioder, behandlingsstatus }) {
    const avklaring = (
      anmodningsperioder.length > 0 &&
      anmodningsperioder.every(anmodningsperiode => anmodningsperiode.anmodningSaksflytSendt) &&
      KV.objektTilKode(behandlingsstatus) === MKV.Koder.behandlinger.status.UNDER_BEHANDLING
    );

    return avklaring;
  }
}

export default Artikkel16;
