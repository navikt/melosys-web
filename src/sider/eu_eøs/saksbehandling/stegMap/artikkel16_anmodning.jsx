import MKV from "../../../../melosyskodeverk";

import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";

import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingArtikkel16Anmodning from "../../stegKomponenter/vurderingArtikkel16Anmodning";
import { hentBegrunnelser, hentVilkar, hentVilkarEllerNull } from "../../../../domeneUtils";

const { UNDER_BEHANDLING, AVSLUTTET } = MKV.Koder.behandlinger.behandlingsstatus;

class Artikkel16Anmodning extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const art16_1 = hentVilkarEllerNull(MKV.Koder.vilkaar.FO_883_2004_ART16_1, propsLight.vilkar);
    const unntaksvilkår = propsLight.konvensjonStorbritanniaToggleEnabled ? propsLight.unntaksvilkår : art16_1;

    this.kriterier = [
      {
        exec: () => Artikkel16Anmodning.skalArt16SvarstegVaereSynlig(propsLight),
        nesteSteg: STEG.ARTIKKEL_16_MOTTA_SVAR,
      },
    ];
    this.id = STEG.ARTIKKEL_16_ANMODNING;
    this.tittel = "Artikkel 16.1";
    this.komponent = VurderingArtikkel16Anmodning;
    this.samleRelevanteData = (_propsLight) => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = (_propsLight) => {
      const muligeBegrunnelseValg = _propsLight.erIDirekteTilArtikkel16Flyt
        ? MKV.KTObjects.begrunnelser.art16_1_anmodning_uten_art12
        : MKV.KTObjects.begrunnelser.art16_1_anmodning;

      return {
        muligeBegrunnelseValg,
        erIDirekteTilArtikkel16Flyt: _propsLight.erIDirekteTilArtikkel16Flyt,
        art16_1: unntaksvilkår,
        harAvklaring: Artikkel16Anmodning.harAvklaring(_propsLight),
      };
    };
    this.handlers = {
      lagreOgBestillAnmodningsperioder: this._propsLight.tilgjengeligeHandlers?.lagreOgBestillAnmodningsperioder,
      tilbake: propsLight.tilgjengeligeHandlers?.tilbake,
      byggAnmodningsperioderHandler: this._propsLight.tilgjengeligeHandlers?.byggAnmodningsperioderHandler,
      oppdaterOgLagreBehandlinger: this._propsLight.tilgjengeligeHandlers?.oppdaterOgLagreBehandlinger,
      lagreVilkarHandler: this._propsLight.tilgjengeligeHandlers?.lagreVilkarHandler,
      lagreAnmodningsperioderHandler: this._propsLight.tilgjengeligeHandlers?.lagreAnmodningsperioderHandler,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers?.oppdaterStegData(this.id, felt, verdi),
      slettData: (data) => this._propsLight.tilgjengeligeHandlers?.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }

  static skalArt16SvarstegVaereSynlig(propsLight) {
    const { behandlingsstatus, anmodningsperiodesvar, anmodningsperioder } = propsLight;
    const behandlingsstatusKode = KV.objektTilKode(behandlingsstatus);

    return (
      (this.behandlingErUnderBehandling(behandlingsstatusKode) ||
        this.behandlingErAvsluttetOgUtlandHarBesvartAnmodning(behandlingsstatusKode, anmodningsperiodesvar)) &&
      this.anmodningErSendtUtland(anmodningsperioder)
    );
  }

  static behandlingErUnderBehandling(behandlingsstatusKode) {
    return behandlingsstatusKode === UNDER_BEHANDLING;
  }

  static behandlingErAvsluttetOgUtlandHarBesvartAnmodning(behandlingsstatusKode, anmodningsperiodesvar) {
    return behandlingsstatusKode === AVSLUTTET && !this.anmodningsperiodesvarErTom(anmodningsperiodesvar);
  }

  static anmodningsperiodesvarErTom(anmodningsperiodesvar) {
    return (
      anmodningsperiodesvar.anmodningsperiodeSvarType === null &&
      anmodningsperiodesvar.endretPeriode?.tom === null &&
      anmodningsperiodesvar.endretPeriode?.fom === null &&
      anmodningsperiodesvar.begrunnelseFritekst === null
    );
  }

  static anmodningErSendtUtland(anmodningsperioder) {
    return (
      anmodningsperioder.length > 0 && anmodningsperioder.every((anmodningsperiode) => anmodningsperiode.sendtUtland)
    );
  }

  static harAvklaring({ anmodningsperioder, vilkar, unntaksvilkår, konvensjonStorbritanniaToggleEnabled }) {
    const unntakFraBestemmelseErSatt = anmodningsperioder?.some(
      (anmodningsperiode) => anmodningsperiode.unntakFraBestemmelse
    );
    const minstEnBegrunnelseErValgt = konvensjonStorbritanniaToggleEnabled
      ? !Utils._isEmpty(unntaksvilkår?.begrunnelseKoder)
      : hentBegrunnelser(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1, vilkar)
          .length > 0;

    return unntakFraBestemmelseErSatt && minstEnBegrunnelseErValgt;
  }
}

export default Artikkel16Anmodning;
