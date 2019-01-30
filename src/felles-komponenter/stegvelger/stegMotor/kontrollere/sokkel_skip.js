import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingSokkelSkip from '../../stegKomponenter/vurderingSokkelSkip';
import { SOKKEL, SKIP, VurderingSokkelSkipTyper } from '../../../../koder';

class SokkelSkip extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this._kriterier = [
      {
        beskrivelse: 'sokkelSkipKonklusjon ER LIK "SOKKEL_UTLAND" (videre til 12.1 eller 12.2)',
        exec: avklartefakta => SokkelSkip.finnAvklaring(avklartefakta, VurderingSokkelSkipTyper.SOKKEL_UTLAND),
        nesteSteg: STEG.ARBEIDSGIVERE,
      },
      {
        beskrivelse: 'sokkelSkipKonklusjon ER LIK "SKIP_ETT_LAND" (videre til 12.1 eller 12.2)',
        exec: avklartefakta => SokkelSkip.finnAvklaring(avklartefakta, VurderingSokkelSkipTyper.SKIP_ETT_LAND),
        nesteSteg: STEG.ARBEIDSGIVERE,
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
      begrunnelser: _propsLight.begrunnelser.sokkel,
      skjema: _propsLight.skjema,
      redigerbart: _propsLight.redigerbart,
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

  // Hvis SKIP er valgt som vurdering, så skal det ikke legges inn
  // en begrunnelse.
  static alleErAvklart = (sokkelEllerSkip, sokkelSkipKonklusjon) => {
    const avklartSokkelEllerSkip = sokkelEllerSkip.length > 0 && sokkelEllerSkip
      .map(enkelt => {
        if (enkelt.installasjonsType === SOKKEL && enkelt.installasjonsTypeBegrunnelse && enkelt.arbeidsland) { return true; }
        return (enkelt.installasjonsType === SKIP && enkelt.arbeidsland && true);
      })
      .every(enkelt => enkelt === true);

    const avklartArbeidSokkelSkip = sokkelSkipKonklusjon && sokkelSkipKonklusjon !== '';

    return (avklartSokkelEllerSkip && avklartArbeidSokkelSkip);
  };
}

export default SokkelSkip;
