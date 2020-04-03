import * as KV from '../../../kodeverk';
import * as Utils from '../../../utils';

import MKV from '../../../melosyskodeverk';

import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingUtpekt from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingUtpekt';

import { hentLovvalgsbestemmelse } from '../../../regler/lovvalgsbestemmelser';
import { hentLovvalgsland } from '../../../regler/lovvalgsland';
import { hentFakta, hentFaktaVerdi } from '../../../regler/avklartefakta';

class VurderUtpeking extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const {
      lovvalgsperioder,
      avklartefakta,
      vurderUtpekingValid,
      behandlingstype,
    } = propsLight;

    const lovvalgsbestemmelse = hentLovvalgsbestemmelse(lovvalgsperioder);
    const lovvalgsland = hentLovvalgsland(lovvalgsperioder);

    const utpekingGodkjentFakta = hentFakta(KV.Koder.avklartefaktaKoder.UTPEKING_GODKJENT, avklartefakta);

    const utpekingGodkjent = this.utpekingGodkjent(utpekingGodkjentFakta);
    const utpekingIkkeGodkjent = this.utpekingIkkeGodkjent(utpekingGodkjentFakta);

    const harAvklaring = this.harAvklaring(utpekingGodkjentFakta, lovvalgsbestemmelse, vurderUtpekingValid);

    const lovvalgNorge = behandlingstype.kode === MKV.Koder.behandlinger.behandlingstyper.BESLUTNING_LOVVALG_NORGE;
    const lovvalgAnnetLand = behandlingstype.kode === MKV.Koder.behandlinger.behandlingstyper.BESLUTNING_LOVVALG_ANNET_LAND;

    this.kriterier = [
      {
        exec: () => harAvklaring && utpekingGodkjent && lovvalgNorge,
        nesteSteg: STEG.GODKJENN_UTPEKING_NORGE,
      },
      {
        exec: () => harAvklaring && utpekingGodkjent && lovvalgAnnetLand,
        nesteSteg: STEG.GODKJENN_UTPEKING_ANNET_LAND,
      },
      {
        exec: () => harAvklaring && utpekingIkkeGodkjent,
        nesteSteg: STEG.AVSLAA_UTPEKING,
      },
    ];
    this.id = STEG.VURDER_UTPEKING;
    this.tittel = 'Vurdering';
    this.komponent = VurderingUtpekt;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => ({
      harAvklaring,
      lovvalgsbestemmelse,
      lovvalgsland,
      utpekingGodkjentFakta,
      utpekingGodkjent,
      utpekingIkkeGodkjent,
    });
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }

  utpekingGodkjent = utpekingGodkjentFakta => (
    hentFaktaVerdi(utpekingGodkjentFakta) === KV.Koder.UtpekingAvNorgeGodkjenning.GODKJENN
  );

  utpekingIkkeGodkjent = utpekingGodkjentFakta => (
    hentFaktaVerdi(utpekingGodkjentFakta) === KV.Koder.UtpekingAvNorgeGodkjenning.IKKE_GODKJENN
  );

  harAvklaring = (utpekingGodkjentFakta, lovvalgsbestemmelse, vurderUtpekingValid) => {
    if (this.utpekingGodkjent(utpekingGodkjentFakta)) {
      return Boolean(lovvalgsbestemmelse && !Utils._isEmpty(utpekingGodkjentFakta) && vurderUtpekingValid);
    } else if (this.utpekingIkkeGodkjent(utpekingGodkjentFakta)) {
      return Boolean(!Utils._isEmpty(utpekingGodkjentFakta) && vurderUtpekingValid);
    }
    return false;
  };
}

export default VurderUtpeking;
