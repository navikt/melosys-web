import * as MKV from 'melosys-kodeverk';
import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import * as KV from '../../../../../../kodeverk';
import * as Utils from '../../../../../../utils';

import { hentFakta, hentFaktaListe, hentFaktaVerdi } from '../../../../../../regler/avklartefakta';
import VurderingArbeidsmonster from '../../stegKomponenter/vurderingArbeidsmonster';
import { BoolskAvklartfaktaType } from '../../../../../../kodeverk/koder';
import Yrkesaktivitet from './yrkesaktivitet';

class Arbeidsmonster extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'Ga videre til forretningssted hvis aktivitet i norge er avklart',
        exec: avklartefakta => {
          const aktivitetINorge = hentFakta(KV.Koder.avklartefaktaKoder.AKTIVITET_I_NORGE, avklartefakta);

          return (
            aktivitetINorge &&
            hentFaktaVerdi(aktivitetINorge) === KV.Koder.VurderingVesentligAktivitetINorgeTyper.UNDER_25_PROSENT &&
            Yrkesaktivitet.erArbeidstaker(avklartefakta)
          );
        },
        nesteSteg: STEG.FORRETNINGSSTED,
      },
      {
        beskrivelse: 'vedtak art 13.1 a',
        exec: avklartefakta => {
          const aktivitetINorge = hentFakta(KV.Koder.avklartefaktaKoder.AKTIVITET_I_NORGE, avklartefakta);

          return hentFaktaVerdi(aktivitetINorge) === KV.Koder.VurderingVesentligAktivitetINorgeTyper.OVER_25_PROSENT &&
          Yrkesaktivitet.erArbeidstaker(avklartefakta);
        },
        nesteSteg: STEG.ARTIKKEL_13_1_A_VEDTAK,
      },
      {
        beskrivelse: 'Stopp steg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.ARBEIDSMONSTER;
    this.tittel = 'Arbeids\u00ADmønster';
    this.komponent = VurderingArbeidsmonster;
    this.samleRelevanteData = _propsLight => ({
      arbeidsland: _propsLight.arbeidsland,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const marginaltArbeid = hentFaktaListe(KV.Koder.avklartefaktaKoder.MARGINALT_ARBEID, _propsLight.avklartefakta);
      const aktivitetINorge = hentFakta(KV.Koder.avklartefaktaKoder.AKTIVITET_I_NORGE, _propsLight.avklartefakta);

      const landMedVesentligArbeid = this.hentLandMedVesentligArbeid(_propsLight.arbeidsland, marginaltArbeid);
      const erNorgeValgt = landMedVesentligArbeid.includes(MKV.Koder.landkoder.NO);
      const aktivitetINorgeNodvendig = landMedVesentligArbeid.length > 1 && erNorgeValgt;

      const harAvklaring = landMedVesentligArbeid.length > 0 &&
        Yrkesaktivitet.erArbeidstaker(_propsLight.avklartefakta) &&
        (aktivitetINorgeNodvendig ^ Utils._isNil(hentFaktaVerdi(aktivitetINorge))) === 1;

      return ({
        marginaltArbeid,
        aktivitetINorge,
        landMedVesentligArbeid,
        erNorgeValgt,
        aktivitetINorgeNodvendig,
        harAvklaring,
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
