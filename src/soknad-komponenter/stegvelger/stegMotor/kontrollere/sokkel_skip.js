import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingSokkelSkip from '../../stegKomponenter/vurderingSokkelSkip';
import * as KV from '../../../../kodeverk';
import { hentFaktaListe, hentFakta, hentFaktaVerdi } from '../../../../regler/avklartefakta';

class SokkelSkip extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this.kriterier = [
      {
        beskrivelse: 'sokkelSkipKonklusjon ER LIK "SOKKEL_NORSK" (til vedtak)',
        exec: avklartefakta => SokkelSkip.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SOKKEL_NORSK),
        nesteSteg: STEG.VEDTAK,
      },
      {
        beskrivelse: 'sokkelSkipKonklusjon ER LIK "SOKKEL_UTLAND" (videre til 12.1 eller 12.2)',
        exec: avklartefakta => SokkelSkip.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SOKKEL_UTLAND),
        nesteSteg: STEG.VIRKSOMHETER,
      },
      {
        beskrivelse: 'sokkelSkipKonklusjon ER LIK "SKIP_ETT_LAND" (videre til 12.1 eller 12.2)',
        exec: avklartefakta => SokkelSkip.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SKIP_ETT_LAND),
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
      skjema: _propsLight.skjema,
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const installasjonArbeidslandListe = hentFaktaListe(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, _propsLight.avklartefakta);
      const installasjonArbeidslandTypeListe = hentFaktaListe(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND_TYPE, _propsLight.avklartefakta);
      const sokkelEllerSkipListe = hentFaktaListe(KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP, _propsLight.avklartefakta);
      const sokkelSkipKonklusjon = hentFakta(KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP, _propsLight.avklartefakta);

      return ({
        harAvklaring: SokkelSkip.alleErAvklart(sokkelEllerSkipListe, sokkelSkipKonklusjon, installasjonArbeidslandListe),
        sokkelEllerSkipListe,
        sokkelSkipKonklusjon,
        installasjonArbeidslandListe,
        installasjonArbeidslandTypeListe,
      });
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      slettAllDataForSteg: () => this._propsLight.tilgjengeligeHandlers.slettAllDataForSteg(this.id),
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (type, felt) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, type, felt),
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
