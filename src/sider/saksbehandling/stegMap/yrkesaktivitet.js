import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingYrkesaktivitet from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingYrkesaktivitet';
import Yrkesgruppe from './yrkesgruppe';

import MKV from '../../../melosyskodeverk';
import * as KV from '../../../kodeverk';
import { hentFakta } from '../../../regler/avklartefakta';

class Yrkesaktivitet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const erSokkelEllerSkip = Yrkesgruppe.finnAvklaring(propsLight.avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP);
    const { erSoknad, behandlingstype } = propsLight;
    const erNyVurdering = KV.objektTilKode(behandlingstype) === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
    const erSoknadEllerSokkelSkip = erSoknad || erSokkelEllerSkip || erNyVurdering;

    this.kriterier = [
      {
        exec: avklartefakta => {
          const erOrdinaerArbeidstaker = Yrkesaktivitet.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER);
          return erSoknadEllerSokkelSkip && erOrdinaerArbeidstaker;
        },
        nesteSteg: STEG.FORUTGAENDE_MEDLEMSKAP,
      },
      {
        exec: avklartefakta => {
          const erSelvstendigNaeringsdrivende = Yrkesaktivitet.erSelvstendigNaeringsdrivende(avklartefakta);
          return erSoknadEllerSokkelSkip && erSelvstendigNaeringsdrivende;
        },
        nesteSteg: STEG.NORMALT_DRIVER_VIRKSOMHET,
      },
      {
        exec: avklartefakta => {
          const erToEllerFlereLand = propsLight.erSoknadArbeidFlereLand;
          const erYrkesAktivitetValgt = (
            Yrkesaktivitet.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER) ||
            Yrkesaktivitet.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE) ||
            Yrkesaktivitet.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_OG_SELVSTENDIG) ||
            Yrkesaktivitet.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetTyper.TJENESTEPERSON_NORSK_STATSFORVANTLING)
          );
          return erToEllerFlereLand && erYrkesAktivitetValgt;
        },
        nesteSteg: STEG.ARBEIDSMONSTER,
      },
    ];
    this.id = STEG.YRKESAKTIVITET;
    this.tittel = 'Yrkes-aktivitet';
    this.komponent = VurderingYrkesaktivitet;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
      erSoknadArbeidFlereLand: _propsLight.erSoknadArbeidFlereLand,
    });
    this.beregnRelevantUI = _propsLight => {
      const yrkesaktivitet = hentFakta(KV.Koder.avklartefaktaKoder.YRKESAKTIVITET, _propsLight.avklartefakta);

      const skjulArbeidstakerFrilanserOgSelvstendigNaeringsdrivende = erSoknadEllerSokkelSkip;

      return ({
        skjulArbeidstakerFrilanserOgSelvstendigNaeringsdrivende,
        harAvklaring: yrkesaktivitet.fakta && yrkesaktivitet.fakta.length > 0,
        yrkesaktivitet,
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
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === STEG.YRKESAKTIVITET);
    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  };

  static erArbeidstaker = avklartefakta => (
    Yrkesaktivitet.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER)
  )

  static erSelvstendigNaeringsdrivende = avklartefakta => (
    Yrkesaktivitet.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE)
  )

  static erArbeidstakerOgSelvstendigNaeringsdrivende = avklartefakta => (
    Yrkesaktivitet.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_OG_SELVSTENDIG)
  )
}

export default Yrkesaktivitet;
