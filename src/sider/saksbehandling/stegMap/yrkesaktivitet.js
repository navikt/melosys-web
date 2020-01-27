import Steg from '../komponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../komponenter/stegvelger/stegMotor/typer';
import VurderingYrkesaktivitet from '../komponenter/stegvelger/stegKomponenter/vurderingYrkesaktivitet';
import YrkesaktivitetAntallLand from './yrkesaktivitet_antall_land';
import Yrkesgruppe from './yrkesgruppe';

import * as KV from '../../../kodeverk';
import { hentFakta } from '../../../regler/avklartefakta';

class Yrkesaktivitet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'yrkesaktivitet ER LIK "ORDINAER_ARBEIDSTAKER" && VurderingYrkesaktivitetAntallLandTyper ER LIK "ETT_LAND_IKKE_NORGE"',
        exec: avklartefakta => {
          const erKunEttLand = YrkesaktivitetAntallLand.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetAntallLandTyper.ETT_LAND_IKKE_NORGE);
          const erSokkelEllerSkip = Yrkesgruppe.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP);
          const erOrdinaerArbeidstaker = Yrkesaktivitet.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER);
          return (erKunEttLand || erSokkelEllerSkip) && erOrdinaerArbeidstaker;
        },
        nesteSteg: STEG.FORUTGAENDE_MEDLEMSKAP,
      },
      {
        beskrivelse: 'yrkesaktivitet ER LIK "SELVSTENDIG_NAERINGSDRIVENDE" && VurderingYrkesaktivitetAntallLandTyper ER LIK "ETT_LAND_IKKE_NORGE"',
        exec: avklartefakta => {
          const erKunEttLand = YrkesaktivitetAntallLand.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetAntallLandTyper.ETT_LAND_IKKE_NORGE);
          const erSokkelEllerSkip = Yrkesgruppe.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP);
          const erSelvstendigNaeringsdrivende = Yrkesaktivitet.erSelvstendigNaeringsdrivende(avklartefakta);
          return (erKunEttLand || erSokkelEllerSkip) && erSelvstendigNaeringsdrivende;
        },
        nesteSteg: STEG.NORMALT_DRIVER_VIRKSOMHET,
      },
      {
        beskrivelse: 'yrkesaktivitetAntallLand ER LIK "TO_ELLER_FLERE_LAND"',
        exec: avklartefakta => {
          const erToEllerFlereLand = YrkesaktivitetAntallLand.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetAntallLandTyper.TO_ELLER_FLERE_LAND);
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
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.YRKESAKTIVITET;
    this.tittel = 'Yrkes-aktivitet';
    this.komponent = VurderingYrkesaktivitet;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const yrkesaktivitet = hentFakta(KV.Koder.avklartefaktaKoder.YRKESAKTIVITET, _propsLight.avklartefakta);

      const erKunEttLand = YrkesaktivitetAntallLand.finnAvklaring(_propsLight.avklartefakta, KV.Koder.VurderingYrkesaktivitetAntallLandTyper.ETT_LAND_IKKE_NORGE);
      const erSokkelEllerSkip = Yrkesgruppe.finnAvklaring(_propsLight.avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP);
      const skjulArbeidstakerFrilanserOgSelvstendigNaeringsdrivende = erKunEttLand || erSokkelEllerSkip;

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
    Yrkesaktivitet.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER) ||
    Yrkesaktivitet.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_OG_SELVSTENDIG)
  )

  static erSelvstendigNaeringsdrivende = avklartefakta => (
    Yrkesaktivitet.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE)
  )
}

export default Yrkesaktivitet;
