import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingForretningssted from '../../stegKomponenter/vurderingForretningssted';
import { hentFaktaListe } from '../../../../regler/avklartefakta';
import * as KV from '../../../../kodeverk';

class Forretningssted extends Steg {
  constructor(avklartefakta) {
    super(avklartefakta);
    this.kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this.id = STEG.FORRETNINGSSTED;
    this.tittel = 'Forretnings\u00ADsted';
    this.komponent = VurderingForretningssted;
    this.samleRelevanteData = _propsLight => ({
      valgteVirksomheter: _propsLight.valgteVirksomheter,
      avklarteForretningsland: hentFaktaListe(KV.Koder.avklartefaktaKoder.ARBEIDSGIVERS_FORRETNINGSSTED, _propsLight.avklartefakta),
    });

    this.beregnRelevantUI = () => {};
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettAllDataForSteg: () => this._propsLight.tilgjengeligeHandlers.slettAllDataForSteg(this.id),
    };
    this.status = FANE_STATUS.OK;
  }
}

export default Forretningssted;
