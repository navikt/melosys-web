import MKV from '../../../melosyskodeverk';

import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingUtpekt from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingUtpekt';

import { hentLovvalgsbestemmelse } from '../../../regler/lovvalgsbestemmelser';

class VurderUtpeking extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const {
      lovvalgsperioder,
      vurderUtpekingValid,
      behandlingstema,
      saksopplysninger,
      vurder_utpeking_skjema,
    } = propsLight;

    const redigerbart = propsLight.generiskStegRedigerbart;

    const { sed = {} } = saksopplysninger;
    const lovvalgsbestemmelse = hentLovvalgsbestemmelse(lovvalgsperioder) || sed.lovvalgsbestemmelse;
    const lovvalgsland = sed.lovvalgslandKode;

    const { utpekingVurdering } = vurder_utpeking_skjema;

    const utpekingErGodkjent = this.utpekingGodkjent(utpekingVurdering);
    const utpekingErIkkeGodkjent = this.utpekingIkkeGodkjent(utpekingVurdering);

    const harAvklaring = this.harAvklaring(utpekingVurdering, lovvalgsbestemmelse, vurderUtpekingValid);

    const lovvalgNorge = behandlingstema.kode === MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE;
    const lovvalgAnnetLand = behandlingstema.kode === MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND;

    this.kriterier = [
      {
        exec: () => harAvklaring && utpekingErGodkjent && lovvalgNorge,
        nesteSteg: STEG.GODKJENN_UTPEKING_NORGE,
      },
      {
        exec: () => harAvklaring && utpekingErGodkjent && lovvalgAnnetLand,
        nesteSteg: STEG.GODKJENN_UTPEKING_ANNET_LAND,
      },
      {
        exec: () => harAvklaring && utpekingErIkkeGodkjent,
        nesteSteg: STEG.AVSLAA_UTPEKING,
      },
    ];
    this.id = STEG.VURDER_UTPEKING;
    this.tittel = 'Vurdering';
    this.komponent = VurderingUtpekt;
    this.samleRelevanteData = _propsLight => ({
      redigerbart,
    });
    this.beregnRelevantUI = _propsLight => ({
      harAvklaring,
      lovvalgsbestemmelse,
      lovvalgsland,
    });
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }

  utpekingGodkjent = utpekingVurdering => (
    utpekingVurdering === MKV.Koder.utfallregistreringunntak.GODKJENT
  );

  utpekingIkkeGodkjent = utpekingVurdering => (
    utpekingVurdering === MKV.Koder.utfallregistreringunntak.IKKE_GODKJENT
  );

  harAvklaring = (utpekingVurdering, lovvalgsbestemmelse, vurderUtpekingValid) => {
    if (this.utpekingGodkjent(utpekingVurdering)) {
      return Boolean(lovvalgsbestemmelse && vurderUtpekingValid);
    } else if (this.utpekingIkkeGodkjent(utpekingVurdering)) {
      return Boolean(vurderUtpekingValid);
    }
    return false;
  };
}

export default VurderUtpeking;
