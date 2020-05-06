import MKV from '../../../melosyskodeverk';
import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import * as KV from '../../../kodeverk';
import * as Utils from '../../../utils';

import { hentFakta, hentFaktaListe, hentFaktaVerdi } from '../../../regler/avklartefakta';
import VurderingArbeidsmonster from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingArbeidsmonster';
import { BoolskAvklartfaktaType } from '../../../kodeverk/koder';
import Yrkesaktivitet from './yrkesaktivitet';

class Arbeidsmonster extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const aktivitetINorge = hentFakta(KV.Koder.avklartefaktaKoder.AKTIVITET_I_NORGE, propsLight.avklartefakta);
    const loennetArbeidAntallLandFakta = hentFakta(KV.Koder.avklartefaktaKoder.LOENNET_ARBEID_ANTALL_LAND, propsLight.avklartefakta);
    const offentligArbeidAntallLandFakta = hentFakta(KV.Koder.avklartefaktaKoder.OFFENTLIG_ARBEID_ANTALL_LAND, propsLight.avklartefakta);
    const erArbeidstaker = Yrkesaktivitet.erArbeidstaker(propsLight.avklartefakta);
    const erSelvstendigNaeringsdrivende = Yrkesaktivitet.erSelvstendigNaeringsdrivende(propsLight.avklartefakta);
    const erArbeidstakerOgSelvstendigNaeringsdrivende = Yrkesaktivitet.erArbeidstakerOgSelvstendigNaeringsdrivende(propsLight.avklartefakta);
    const erOffentligTjenestemann = Yrkesaktivitet.erOffentligTjenestemann(propsLight.avklartefakta);
    const offentligArbeidNorge = hentFaktaVerdi(offentligArbeidAntallLandFakta) === KV.Koder.OffentligArbeidAntallLand.NORGE_OG_ANNEN_VIRKSOMHET;
    const offentligArbeidAnnetLand = hentFaktaVerdi(offentligArbeidAntallLandFakta) === KV.Koder.OffentligArbeidAntallLand.ANNET_LAND_OG_ANNEN_VIRKSOMHET;
    const offentligArbeidIFlereLand = hentFaktaVerdi(offentligArbeidAntallLandFakta) === KV.Koder.OffentligArbeidAntallLand.FLERE_LAND_OG_ANNEN_VIRKSOMHET;
    const loennetArbeidIFlereLand = hentFaktaVerdi(loennetArbeidAntallLandFakta) === KV.Koder.LoennetArbeidAntallLand.FLERE_LAND;
    const loennetArbeidIEttLand = hentFaktaVerdi(loennetArbeidAntallLandFakta) === KV.Koder.LoennetArbeidAntallLand.ETT_LAND;
    const aktivitetNorgeOver25Prosent = hentFaktaVerdi(aktivitetINorge) === KV.Koder.VurderingVesentligAktivitetINorgeTyper.OVER_25_PROSENT;
    const aktivitetNorgeUnder25Prosent = hentFaktaVerdi(aktivitetINorge) === KV.Koder.VurderingVesentligAktivitetINorgeTyper.UNDER_25_PROSENT;

    this.kriterier = [
      {
        exec: () => (
          aktivitetNorgeUnder25Prosent && (
            (aktivitetINorge && erArbeidstaker) ||
            loennetArbeidIFlereLand ||
            offentligArbeidIFlereLand
          )
        ),
        nesteSteg: STEG.FORRETNINGSSTED,
      },
      {
        exec: () => (
          aktivitetINorge &&
          aktivitetNorgeUnder25Prosent &&
          erSelvstendigNaeringsdrivende
        ),
        nesteSteg: STEG.ARTIKKEL_13_2_B,
      },
      {
        exec: () => (
          aktivitetNorgeOver25Prosent &&
          (erArbeidstaker || offentligArbeidIFlereLand)
        ),
        nesteSteg: STEG.ARTIKKEL_13_1_A_VEDTAK,
      },
      {
        exec: () => (
          aktivitetNorgeOver25Prosent &&
          erSelvstendigNaeringsdrivende
        ),
        nesteSteg: STEG.ARTIKKEL_13_2_A_VEDTAK,
      },
      {
        exec: () => (
          (loennetArbeidIEttLand && erArbeidstakerOgSelvstendigNaeringsdrivende) ||
          (loennetArbeidIFlereLand && aktivitetNorgeOver25Prosent)
        ),
        nesteSteg: STEG.ARTIKKEL_13_3_VEDTAK,
      },
      {
        exec: () => offentligArbeidNorge,
        nesteSteg: STEG.ARTIKKEL_13_4_VEDTAK,
      },
      {
        exec: () => offentligArbeidAnnetLand,
        nesteSteg: STEG.ARTIKKEL_13_4_UTPEK_LAND,
      },
    ];
    this.id = STEG.ARBEIDSMONSTER;
    this.tittel = 'Arbeids\u00ADmønster';
    this.komponent = VurderingArbeidsmonster;
    this.samleRelevanteData = _propsLight => ({
      arbeidsland: _propsLight.arbeidslandMedYrkesaktivitet,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const marginaltArbeid = hentFaktaListe(KV.Koder.avklartefaktaKoder.MARGINALT_ARBEID, _propsLight.avklartefakta);

      const landMedVesentligArbeid = this.hentLandMedVesentligArbeid(_propsLight.arbeidsland, marginaltArbeid);
      const erNorgeValgt = landMedVesentligArbeid.includes(MKV.Koder.landkoder.NO);
      const finnesLandMedVesentligArbeidOgNorgeErValgt = landMedVesentligArbeid.length > 1 && erNorgeValgt;
      const aktivitetINorgeNodvendig = finnesLandMedVesentligArbeidOgNorgeErValgt &&
        (erArbeidstakerOgSelvstendigNaeringsdrivende ? loennetArbeidIFlereLand : true) &&
        (erOffentligTjenestemann ? offentligArbeidIFlereLand : true);
      const erYrkesaktivitetAntallLandNodvendig = finnesLandMedVesentligArbeidOgNorgeErValgt &&
        erArbeidstakerOgSelvstendigNaeringsdrivende;
      const erYrkesAktivitetOffentligNodvendig = finnesLandMedVesentligArbeidOgNorgeErValgt &&
        erOffentligTjenestemann;
      const harAvklaring = landMedVesentligArbeid.length > 0 &&
        (aktivitetINorgeNodvendig ^ Utils._isNil(hentFaktaVerdi(aktivitetINorge))) === 1 &&
        (erArbeidstakerOgSelvstendigNaeringsdrivende ? (loennetArbeidIEttLand || loennetArbeidIFlereLand) : true) &&
        (erOffentligTjenestemann ? !Utils._isNil(hentFaktaVerdi(offentligArbeidAntallLandFakta)) : true);

      const yrkesaktivitet = hentFaktaVerdi(hentFakta(KV.Koder.avklartefaktaKoder.YRKESAKTIVITET, _propsLight.avklartefakta));

      return ({
        marginaltArbeid,
        aktivitetINorge,
        landMedVesentligArbeid,
        erNorgeValgt,
        aktivitetINorgeNodvendig,
        harAvklaring,
        yrkesaktivitet,
        erYrkesaktivitetAntallLandNodvendig,
        erYrkesAktivitetOffentligNodvendig,
        loennetArbeidAntallLandFakta,
        offentligArbeidAntallLandFakta,
      });
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;

    this.hentLandMedVesentligArbeid = (arbeidsland, marginaltArbeid) => {
      const erArbeidMarginaltILand = landkode => (
        marginaltArbeid.some(ma => (
          ma.subjektID === landkode &&
          hentFaktaVerdi(ma) === BoolskAvklartfaktaType.SANN
        ))
      );
      return arbeidsland.map(al => al.kode)
        .filter(kode => !erArbeidMarginaltILand(kode));
    };
  }
}

export default Arbeidsmonster;
