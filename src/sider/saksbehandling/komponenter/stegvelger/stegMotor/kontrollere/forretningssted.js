/* eslint-disable consistent-return */
import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingForretningssted from '../../stegKomponenter/vurderingForretningssted';
import { hentFakta, hentFaktaListe, hentFaktaVerdi } from '../../../../../../regler/avklartefakta';
import * as KV from '../../../../../../kodeverk';
import * as Utils from '../../../../../../utils';
import { hentLovvalgsbestemmelse } from '../../../../../../regler/lovvalgsbestemmelser';

class Forretningssted extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'vedtaksteg',
        exec: () => {
          const harLovvalgsbestemmelse = this.harLovvalgsbestemmelse(propsLight);
          const harAvklartForretningsland = this.harAvklartForretningsland(propsLight);
          const erOmfattetINorge = hentFaktaVerdi(hentFakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_NORGE, propsLight.avklartefakta)) === KV.Koder.BoolskAvklartfaktaType.SANN;

          return harLovvalgsbestemmelse && harAvklartForretningsland && erOmfattetINorge;
        },
        nesteSteg: STEG.ARTIKKEL_13_1_B_VEDTAK,
      },
      {
        beskrivelse: '',
        exec: () => { // TODO verify
          const harLovvalgsbestemmelse = this.harLovvalgsbestemmelse(propsLight);
          const harAvklartForretningsland = this.harAvklartForretningsland(propsLight);
          const erOmfattetINorge = hentFaktaVerdi(hentFakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_NORGE, propsLight.avklartefakta)) === KV.Koder.BoolskAvklartfaktaType.USANN;

          return harLovvalgsbestemmelse && harAvklartForretningsland && erOmfattetINorge;
        },
        nesteSteg: STEG.ARTIKKEL_13_1_B_UTPEK_LAND,
      },
      {
        beskrivelse: 'dead end',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.FORRETNINGSSTED;
    this.tittel = 'Forretnings\u00ADsted';
    this.komponent = VurderingForretningssted;
    this.samleRelevanteData = _propsLight => ({
      valgteVirksomheter: _propsLight.valgteVirksomheter,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });

    this.beregnRelevantUI = _propsLight => {
      const lovvalgsbestemmelse = hentLovvalgsbestemmelse(_propsLight.lovvalgsperioder);
      const avklarteForretningsland = hentFaktaListe(KV.Koder.avklartefaktaKoder.ARBEIDSGIVERS_FORRETNINGSSTED, _propsLight.avklartefakta);
      const omfattetINorge = hentFakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_NORGE, _propsLight.avklartefakta);
      const omfattetILand = hentFakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND, _propsLight.avklartefakta);

      const harLovvalgsbestemmelse = this.harLovvalgsbestemmelse(_propsLight);
      const harOmfattetAvklaring = this.harOmfattetAvklaring(_propsLight);
      const harAvklartForretningsland = this.harAvklartForretningsland(_propsLight);

      return {
        lovvalgsbestemmelse,
        avklarteForretningsland,
        omfattetINorge,
        omfattetILand,
        harAvklaring: harAvklartForretningsland && harOmfattetAvklaring && harLovvalgsbestemmelse,
      };
    };

    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }

  harLovvalgsbestemmelse = propsLight => {
    const lovvalgsbestemmelse = hentLovvalgsbestemmelse(propsLight.lovvalgsperioder);
    return !Utils._isNil(lovvalgsbestemmelse);
  };

  harOmfattetAvklaring = propsLight => {
    const omfattetINorge = hentFakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_NORGE, propsLight.avklartefakta);
    const omfattetILand = hentFakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND, propsLight.avklartefakta);

    const sokerOmfattetINorge = hentFaktaVerdi(omfattetINorge);
    if (Utils._isNil(sokerOmfattetINorge)) {
      return false;
    }

    if (sokerOmfattetINorge === KV.Koder.BoolskAvklartfaktaType.SANN) {
      return true;
    }

    return !Utils._isNil(hentFaktaVerdi(omfattetILand));
  };

  harAvklartForretningsland = propsLight => {
    const avklarteForretningsland = hentFaktaListe(KV.Koder.avklartefaktaKoder.ARBEIDSGIVERS_FORRETNINGSSTED, propsLight.avklartefakta);

    return propsLight.valgteVirksomheter.every(vv => (
      avklarteForretningsland.some(afl => (
        afl.subjektID === vv.virksomhetId && !Utils._isNil(hentFaktaVerdi(afl))
      ))
    ));
  }
}

export default Forretningssted;
