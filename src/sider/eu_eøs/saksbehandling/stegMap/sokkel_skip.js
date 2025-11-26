import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/stegLegacy";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingSokkelSkip from "../../stegKomponenter/vurderingSokkelSkip/vurderingSokkelSkip";
import * as KV from "../../../../kodeverk";
import MKV from "../../../../melosyskodeverk";
import { hentFaktaListe, hentFakta, hentFaktaVerdi } from "../../../../domeneUtils";

class SokkelSkip extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const sokkelEllerSkipListe = hentFaktaListe(
      KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP,
      propsLight.avklartefakta,
    );
    const sokkelSkipKonklusjon = hentFakta(KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP, propsLight.avklartefakta);
    const installasjonArbeidslandListe = hentFaktaListe(
      KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND,
      propsLight.avklartefakta,
    );
    const alleErAvklart = SokkelSkip.alleErAvklart(
      sokkelEllerSkipListe,
      sokkelSkipKonklusjon,
      installasjonArbeidslandListe,
    );

    this.kriterier = [
      {
        exec: (avklartefakta) =>
          SokkelSkip.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SOKKEL_NORSK) && alleErAvklart,
        nesteSteg: STEG.VIRKSOMHETER,
      },
      {
        exec: (avklartefakta) =>
          SokkelSkip.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SOKKEL_UTLAND) && alleErAvklart,
        nesteSteg: STEG.VIRKSOMHETER,
      },
      {
        exec: (avklartefakta) =>
          SokkelSkip.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SKIP_ETT_LAND) && alleErAvklart,
        nesteSteg: STEG.VIRKSOMHETER,
      },
    ];
    this.id = STEG.SOKKEL_SKIP;
    this.tittel = "Sokkel / skip";
    this.komponent = VurderingSokkelSkip;
    this.samleRelevanteData = (_propsLight) => ({
      begrunnelser: _propsLight.begrunnelser.sokkel,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = (_propsLight) => {
      const installasjonArbeidslandTypeListe = hentFaktaListe(
        KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND_TYPE,
        _propsLight.avklartefakta,
      );
      const arbeidslandListe = hentFaktaListe(MKV.Koder.avklartefaktatyper.ARBEIDSLAND, _propsLight.avklartefakta);

      return {
        harAvklaring: alleErAvklart,
        sokkelEllerSkipListe,
        sokkelSkipKonklusjon,
        installasjonArbeidslandListe,
        installasjonArbeidslandTypeListe,
        arbeidslandListe,
      };
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (data) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(
      (fakta) => fakta.referanse === KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP,
    );

    if (!enkeltFakta) {
      return false;
    }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  };

  static alleErAvklart = (sokkelEllerSkipListe, sokkelSkipKonklusjon, arbeidslandListe) => {
    const avklartSokkelEllerSkip =
      sokkelEllerSkipListe.length > 0 &&
      sokkelEllerSkipListe
        .map((enkelt) => {
          if (!arbeidslandListe.find((land) => land.subjektID === enkelt.subjektID)) {
            return false;
          }
          const installasjonsType = hentFaktaVerdi(enkelt);
          if (installasjonsType === KV.Koder.SOKKEL) {
            return enkelt.begrunnelseKoder.some((kode) => kode);
          }
          return true;
        })
        .every((enkelt) => enkelt === true);

    return avklartSokkelEllerSkip && hentFaktaVerdi(sokkelSkipKonklusjon);
  };
}

export default SokkelSkip;
