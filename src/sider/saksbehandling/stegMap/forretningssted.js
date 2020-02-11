/* eslint-disable consistent-return */
import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingForretningssted from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingForretningssted';
import { hentFakta, hentFaktaListe, hentFaktaVerdi } from '../../../regler/avklartefakta';
import * as KV from '../../../kodeverk';
import * as Utils from '../../../utils';
import { hentLovvalgsbestemmelse } from '../../../regler/lovvalgsbestemmelser';

class Forretningssted extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const perioder = propsLight.omfattesIAnnetLand ? propsLight.utpekingsperioder : propsLight.lovvalgsperioder;
    const harLovvalgsbestemmelse = this.harLovvalgsbestemmelse(perioder);
    const harAvklartForretningsland = this.harAvklartForretningsland(propsLight);
    const erOmfattetINorge = hentFaktaVerdi(hentFakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_NORGE, propsLight.avklartefakta)) === KV.Koder.BoolskAvklartfaktaType.SANN;
    const erOmfattetNorgeVurdert = this.omfattetNorgeVurdert(propsLight);

    const omfattetILandFakta = hentFakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND, propsLight.avklartefakta);
    const omfattetILandFaktaVerdi = hentFaktaVerdi(omfattetILandFakta);
    const erOmfattetILandIkkeNorge = omfattetILandFaktaVerdi && omfattetILandFaktaVerdi !== 'NO';

    this.kriterier = [
      {
        beskrivelse: 'vedtaksteg',
        exec: () => harLovvalgsbestemmelse && harAvklartForretningsland && erOmfattetNorgeVurdert && erOmfattetINorge,
        nesteSteg: STEG.ARTIKKEL_13_1_B_VEDTAK,
      },
      {
        beskrivelse: '',
        exec: () => harLovvalgsbestemmelse && harAvklartForretningsland && erOmfattetNorgeVurdert && erOmfattetILandIkkeNorge,
        nesteSteg: STEG.ARTIKKEL_13_1_B_UTPEK_LAND,
      },
    ];
    this.id = STEG.FORRETNINGSSTED;
    this.tittel = 'Vurdering av 13.1.b';
    this.komponent = VurderingForretningssted;
    this.samleRelevanteData = _propsLight => ({
      valgteVirksomheter: _propsLight.valgteVirksomheter,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });

    this.beregnRelevantUI = _propsLight => {
      const lovvalgsbestemmelse = hentLovvalgsbestemmelse(perioder);
      const avklarteForretningsland = hentFaktaListe(KV.Koder.avklartefaktaKoder.ARBEIDSGIVERS_FORRETNINGSSTED, _propsLight.avklartefakta);
      const omfattetINorge = hentFakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_NORGE, _propsLight.avklartefakta);
      const omfattetILand = hentFakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND, _propsLight.avklartefakta);
      const harOmfattetAvklaring = this.harOmfattetAvklaring(_propsLight);

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

  harLovvalgsbestemmelse = perioder => {
    const lovvalgsbestemmelse = hentLovvalgsbestemmelse(perioder);
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

  omfattetNorgeVurdert = propsLight => {
    const omfattetNorgeAvklarteFakta = hentFakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_NORGE, propsLight.avklartefakta);
    return !Utils._isEmpty(omfattetNorgeAvklarteFakta);
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
