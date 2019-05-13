import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingVirksomhet from '../../stegKomponenter/vurderingVirksomhet';
import * as KV from '../../../../kodeverk';

import SokkelSkip from './sokkel_skip';
import { hentFaktaListe } from '../../../../regler/avklartefakta';

class Virksomheter extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'Valgt minst én arbeidsgiver og yrkesgruppeType === ORDINAER',
        exec: avklartefakta => {
          const harValgtArbeidsgiver = Virksomheter.harValgtArbeidsgiver(avklartefakta);
          const erVanligYrkesaktiv = Virksomheter.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.ORDINAER);
          return harValgtArbeidsgiver && erVanligYrkesaktiv;
        },
        nesteSteg: STEG.YRKESAKTIVITET,
      },
      {
        beskrivelse: 'Valgt minst én arbeidsgiver og yrkesgruppeType === SOKKEL_ELLER_SKIP && sokkelSkipKonklusjon === SOKKEL_UTLAND',
        exec: avklartefakta => {
          const harValgtArbeidsgiver = Virksomheter.harValgtArbeidsgiver(avklartefakta);
          const arbeiderPaSokkelEllerSkip = Virksomheter.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP);
          const erSokkelUtland = SokkelSkip.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SOKKEL_UTLAND);
          return harValgtArbeidsgiver && arbeiderPaSokkelEllerSkip && erSokkelUtland;
        },
        nesteSteg: STEG.YRKESAKTIVITET,
      },
      {
        beskrivelse: 'Valgt minst én arbeidsgiver og yrkesgruppeType === SOKKEL_ELLER_SKIP && sokkelSkipKonklusjon === SKIP_ETT_LAND',
        exec: avklartefakta => {
          const harValgtArbeidsgiver = Virksomheter.harValgtArbeidsgiver(avklartefakta);
          const arbeiderPaSokkelEllerSkip = Virksomheter.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP);
          const erSkipEttLand = SokkelSkip.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SKIP_ETT_LAND);
          return harValgtArbeidsgiver && arbeiderPaSokkelEllerSkip && erSkipEttLand;
        },
        nesteSteg: STEG.BOSTEDSLAND,
      },
      {
        beskrivelse: 'Stopp steg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.VIRKSOMHETER;
    this.tittel = 'Virksomhet';
    this.komponent = VurderingVirksomhet;
    this.samleRelevanteData = _propsLight => ({
      virksomheterIPerioden: _propsLight.virksomheterIPerioden,
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const virksomheter = hentFaktaListe(KV.Koder.avklartefaktaKoder.VIRKSOMHET, _propsLight.avklartefakta);
      const harAvklaring = virksomheter.some(virksomhet => virksomhet.fakta.includes('TRUE'));

      return ({
        harAvklaring,
        virksomheter,
      });
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettAllDataForSteg: () => this._propsLight.tilgjengeligeHandlers.slettAllDataForSteg(this.id),
    };
    this._status = FANE_STATUS.OK;
  }

  static harValgtArbeidsgiver = avklartefakta => avklartefakta.some(enkeltFakta => ((enkeltFakta.referanse === KV.Koder.avklartefaktaKoder.VIRKSOMHET) && enkeltFakta.fakta.includes('TRUE')));

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === STEG.YRKESGRUPPE);
    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  };
}

export default Virksomheter;
