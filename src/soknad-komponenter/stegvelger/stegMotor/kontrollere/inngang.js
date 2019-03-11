import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingInngang from '../../stegKomponenter/vurderingInngang';
import * as KV from '../../../../kodeverk';

class Inngang extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this.kriterier = [
      {
        beskrivelse: 'Hvis minst ett land finnes',
        exec: avklartefakta => (Inngang.harMinstEttGyldigOppholdsland(avklartefakta)),
        nesteSteg: STEG.YRKESGRUPPE,
      },
      {
        beskrivelse: 'Dead end - ingen land',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.INNGANG;
    this.tittel = 'Inngang';
    this.komponent = VurderingInngang;
    this.samleRelevanteData = props => ({
      inngangsvilkar: props.inngang,
      begrunnelser: props.begrunnelser,
      alleLandKoder: props.landkoder,
      avklartefakta: props.avklartefakta,
      redigerbart: props.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const { oppholdsland } = _propsLight.skjema.avklartefakta;
      const harAvklaring = oppholdsland.some(land => land.fakta.includes('TRUE'));
      return ({
        harAvklaring,
      });
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this.status = FANE_STATUS.OK;
  }

  static harMinstEttGyldigOppholdsland = avklartefakta => avklartefakta
    .some(enkeltFakta => ((enkeltFakta.referanse === KV.Koder.OPPHOLDSLAND) && enkeltFakta.fakta.includes('TRUE')));
}

export default Inngang;
