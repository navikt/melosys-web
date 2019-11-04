import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingSokkelSkip from '../../stegKomponenter/vurderingSokkelSkip';
import * as KV from '../../../../../../kodeverk';
import { hentFaktaListe, hentFakta, hentFaktaVerdi } from '../../../../../../regler/avklartefakta';

class SokkelSkip extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const sokkelEllerSkipListe = hentFaktaListe(KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP, propsLight.avklartefakta);
    const sokkelSkipKonklusjon = hentFakta(KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP, propsLight.avklartefakta);
    const installasjonArbeidslandListe = hentFaktaListe(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, propsLight.avklartefakta);
    const alleErAvklart = SokkelSkip.alleErAvklart(sokkelEllerSkipListe, sokkelSkipKonklusjon, installasjonArbeidslandListe);

    this.kriterier = [
      {
        beskrivelse: 'sokkelSkipKonklusjon ER LIK "SOKKEL_NORSK" (til vedtak)',
        exec: avklartefakta => SokkelSkip.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SOKKEL_NORSK) && alleErAvklart,
        nesteSteg: STEG.VEDTAK,
      },
      {
        beskrivelse: 'sokkelSkipKonklusjon ER LIK "SOKKEL_UTLAND" (videre til 12.1 eller 12.2)',
        exec: avklartefakta => SokkelSkip.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SOKKEL_UTLAND) && alleErAvklart,
        nesteSteg: STEG.VIRKSOMHETER,
      },
      {
        beskrivelse: 'sokkelSkipKonklusjon ER LIK "SKIP_ETT_LAND" (videre til 12.1 eller 12.2)',
        exec: avklartefakta => SokkelSkip.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SKIP_ETT_LAND) && alleErAvklart,
        nesteSteg: STEG.VIRKSOMHETER,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.SOKKEL_SKIP;
    this.tittel = 'Sokkel / skip';
    this.komponent = VurderingSokkelSkip;
    this.samleRelevanteData = _propsLight => ({
      begrunnelser: _propsLight.begrunnelser.sokkel,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const installasjonArbeidslandTypeListe = hentFaktaListe(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND_TYPE, _propsLight.avklartefakta);

      return ({
        harAvklaring: alleErAvklart,
        sokkelEllerSkipListe,
        sokkelSkipKonklusjon,
        installasjonArbeidslandListe,
        installasjonArbeidslandTypeListe,
      });
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP);

    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  };

  static alleErAvklart = (sokkelEllerSkipListe, sokkelSkipKonklusjon, arbeidslandListe) => {
    const avklartSokkelEllerSkip = sokkelEllerSkipListe.length > 0 &&
      sokkelEllerSkipListe.map(enkelt => {
        if (!arbeidslandListe.find(land => land.subjektID === enkelt.subjektID)) {
          return false;
        }
        const installasjonsType = hentFaktaVerdi(enkelt);
        if (installasjonsType === KV.Koder.SOKKEL) {
          return enkelt.begrunnelseKoder.length > 0;
        }
        return true;
      }).every(enkelt => enkelt === true);

    return (avklartSokkelEllerSkip && hentFaktaVerdi(sokkelSkipKonklusjon));
  };
}

export default SokkelSkip;
