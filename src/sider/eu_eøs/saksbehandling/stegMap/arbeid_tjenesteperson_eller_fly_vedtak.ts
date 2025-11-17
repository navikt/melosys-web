import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingArbeidTjenestepersonEllerFlyVedtak from "../../stegKomponenter/vurderingArbeidTjenestepersonEllerFlyVedtak/vurderingArbeidTjenestepersonEllerFlyVedtak";
import VurderingArbeidTjenestepersonEllerFlyVedtakLegacy from "../../stegKomponenter/vurderingArbeidTjenestepersonEllerFlyVedtak_Legacy/vurderingArbeidTjenestepersonEllerFlyVedtak";
import type { PropsLight } from "../../../../felleskomponenter/stegvelger/stegMotor/typer";
import { hentFakta } from "../../../../domeneUtils";
import MKV from "../../../../melosyskodeverk";

interface VedtakRelevanteData {
  [key: string]: unknown; // Index signature for base class compatibility
  redigerbart: boolean;
  lovvalgsbestemmelseSomSkalVises: string | undefined;
  lovvalgsbestemmelseSomSkalLagres?: string | undefined;
  informertMyndighetFakta: unknown;
  harFeilmeldinger: boolean | undefined;
}

class ArbeidTjenestepersonEllerFlyVedtak extends Steg {
  constructor(propsLight: PropsLight, stegPosisjon: number) {
    super(propsLight, stegPosisjon);

    const toggleEnabled = propsLight.eøsFaktureringAvTrygdeavgiftToggleEnabled;

    const lovvalgsbestemmelseSomSkalVises =
      propsLight.lovvalgsbestemmelse ===
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A
        ? MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5
        : propsLight.lovvalgsbestemmelse;

    const lovvalgsbestemmelseSomSkalLagres = propsLight.lovvalgsbestemmelse;

    const informertMyndighetFakta = hentFakta(
      MKV.Koder.avklartefaktatyper.INFORMERT_MYNDIGHET,
      propsLight.avklartefakta,
    );

    this.kriterier = [];
    this.id = STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK;
    this.tittel = "Vedtak";
    this.komponent = toggleEnabled
      ? VurderingArbeidTjenestepersonEllerFlyVedtak
      : VurderingArbeidTjenestepersonEllerFlyVedtakLegacy;

    this.samleRelevanteData = (_propsLight: PropsLight): VedtakRelevanteData => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
      lovvalgsbestemmelseSomSkalVises,
      ...(!toggleEnabled && { lovvalgsbestemmelseSomSkalLagres }),
      informertMyndighetFakta,
      harFeilmeldinger: _propsLight.harFeilmeldinger,
    });

    this.beregnRelevantUI = () => ({});

    this.handlers = {
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      lagreLovvalgsperioder: this._propsLight.tilgjengeligeHandlers.lagreLovvalgsperioder,
      ...(!toggleEnabled && { byggLovvalgsperioder: this._propsLight.tilgjengeligeHandlers.byggLovvalgsperioder }),
      oppdaterData: (felt: string, verdi: unknown) =>
        this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id!, felt, verdi),
      slettData: (data?: unknown) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id!, data),
      kontrollerFerdigbehandling: this._propsLight.tilgjengeligeHandlers.kontrollerFerdigbehandling,
      validerMottatteOpplysninger: this._propsLight.tilgjengeligeHandlers.validerMottatteOpplysninger,
    };

    this._status = FANE_STATUS.OK;
  }
}

export default ArbeidTjenestepersonEllerFlyVedtak;
