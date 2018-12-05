import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingSokkelSkip, { VurderingSokkelSkipTyper } from '../../stegKomponenter/vurderingSokkelSkip';

class SokkelSkip extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this._kriterier = [
      {
        beskrivelse: 'sokkelSkipKonklusjon ER LIK "SOKKEL_UTLAND" (videre til 12.1 eller 12.2)',
        exec: avklartefakta => SokkelSkip.finnAvklaring(avklartefakta, VurderingSokkelSkipTyper.SOKKEL_UTLAND),
        nesteSteg: STEG.YRKESAKTIVITET_ANTALL_LAND,
      },
      {
        beskrivelse: 'sokkelSkipKonklusjon ER LIK "SKIP_ETT_LAND" (videre til 12.1 eller 12.2)',
        exec: avklartefakta => SokkelSkip.finnAvklaring(avklartefakta, VurderingSokkelSkipTyper.SKIP_ETT_LAND),
        nesteSteg: STEG.BOSTEDSLAND,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this._id = STEG.SOKKEL_SKIP;
    this._tittel = 'Sokkel / skip';
    this._komponent = VurderingSokkelSkip;
    this._samleRelevanteData = _propsLight => ({
      begrunnelser: _propsLight.begrunnelser.sokkelEllerSkip,
      skjema: _propsLight.skjema,
    });
    this._beregnRelevantUI = _propsLight => {
      const { sokkelEllerSkip = [], sokkelSkipKonklusjon } = _propsLight.skjema.avklartefakta;

      return ({
        harAvklaring: SokkelSkip.alleErAvklart(sokkelEllerSkip, sokkelSkipKonklusjon),
      });
    };
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === 'ARBEID_SOKKEL_SKIP');

    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  };

  static alleErAvklart = (sokkelEllerSkip, sokkelSkipKonklusjon) => {
    const avklartSokkelEllerSkip = sokkelEllerSkip
      .map(enkelt => enkelt.installasjonsType && enkelt.installasjonsTypeBegrunnelse && enkelt.arbeidsland && true)
      .every(enkelt => enkelt === true);
    const avklartArbeidSokkelSkip = sokkelSkipKonklusjon && sokkelSkipKonklusjon !== '';

    return (avklartSokkelEllerSkip && avklartArbeidSokkelSkip);
  };
}

export default SokkelSkip;
