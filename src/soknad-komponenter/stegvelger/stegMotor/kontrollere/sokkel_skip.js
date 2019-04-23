import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingSokkelSkip from '../../stegKomponenter/vurderingSokkelSkip';
import * as KV from '../../../../kodeverk';
import * as Utils from '../../../../utils';

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
      const { sokkelSkipKonklusjon } = _propsLight.skjema.avklartefakta;
      const sokkelEllerSkip = _propsLight.skjema.maritimtArbeid.map(maritimtArbeid => (
        Utils._isEmpty(maritimtArbeid.sokkelEllerSkip) ? {} : maritimtArbeid.sokkelEllerSkip
      ));

      return ({
        harAvklaring: SokkelSkip.alleErAvklart(sokkelEllerSkip, sokkelSkipKonklusjon),
      });
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      settSkjemaVerdi: this._propsLight.tilgjengeligeHandlers.settSkjemaVerdi,
    };
    this.status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === 'ARBEID_SOKKEL_SKIP');

    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  };

  // Hvis SKIP er valgt som vurdering, så skal det ikke legges inn
  // en begrunnelse.
  static alleErAvklart = (sokkelEllerSkip = [], sokkelSkipKonklusjon) => {
    const avklartSokkelEllerSkip = sokkelEllerSkip.length > 0 && sokkelEllerSkip
      .map(enkelt => {
        if (enkelt.installasjonsType === KV.Koder.SOKKEL && enkelt.installasjonsTypeBegrunnelse && enkelt.arbeidsland) { return true; }
        return (enkelt.installasjonsType === KV.Koder.SKIP && enkelt.arbeidsland && true);
      })
      .every(enkelt => enkelt === true);

    const avklartArbeidSokkelSkip = sokkelSkipKonklusjon && sokkelSkipKonklusjon !== '';

    return (avklartSokkelEllerSkip && avklartArbeidSokkelSkip);
  };
}

export default SokkelSkip;
