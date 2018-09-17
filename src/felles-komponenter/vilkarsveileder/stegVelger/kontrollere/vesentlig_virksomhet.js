import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingVesentligVirksomhet from '../../vurderinger/vurderingVesentligVirksomhet';

class VesentligVirksomhet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.YRKESAKTIVITET_FORDELING,
      },
    ];
    this._id = STEG.VESENTLIG_VIRKSOMHET;
    this._tittel = 'Vesentlig virksomhet';
    this._komponent = VurderingVesentligVirksomhet;
    this._samleRelevanteData = _propsLight => ({
      valgteArbeidsgivere: this.finnArbeidsgiverNavn(_propsLight),
      begrunnelser: _propsLight.begrunnelser.vesentligVirksomhet || [],
    });
    this._beregnRelevantUI = () => ({});
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }

  finnArbeidsgiverNavn = () => {
    const valgteArbeidsgivereOrgnr = this._propsLight.skjema.faktaavklaringValgteArbeidsgivere || [];
    const arbeidsgivere = this._propsLight.arbeidsgivereIPerioden.filter(arbeidsgiver => valgteArbeidsgivereOrgnr.includes(arbeidsgiver.orgnr));
    return arbeidsgivere;
  }
}

export default VesentligVirksomhet;
