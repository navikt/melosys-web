import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingVesentligVirksomhet from '../../stegKomponenter/vurderingVesentligVirksomhet';
import { erVilkarOppfylt } from '../../../../regler/vilkar';

class VesentligVirksomhet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'vesentligVirksomhetINorge ER LIK TRUE',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt('ART12_1_VESENTLIG_VIRKSOMHET', alleVilkar),
        nesteSteg: STEG.ARTIKKEL_12,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];

    this._id = STEG.VESENTLIG_VIRKSOMHET;
    this._tittel = 'Vesentlig virksomhet';
    this._komponent = VurderingVesentligVirksomhet;
    this._samleRelevanteData = _propsLight => ({
      valgteArbeidsgivere: _propsLight.valgteArbeidsgivere,
      begrunnelser: _propsLight.begrunnelser.vesentligVirksomhet || [],
    });
    this._beregnRelevantUI = _propsLight => ({
      visBegrunnelser: !_propsLight.skjema.vilkar.vesentligVirksomhet,
    });
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default VesentligVirksomhet;
