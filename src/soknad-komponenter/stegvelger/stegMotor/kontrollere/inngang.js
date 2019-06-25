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
        exec: avklartefakta => (Inngang.harMinstEttGyldigSoknadsland(avklartefakta)),
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
      alleLandkoder: props.landkoder,
      avklartefakta: props.avklartefakta,
      redigerbart: props.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const soknadsland = _propsLight.avklartefakta.filter(af => af.referanse === KV.Koder.SOKNADSLAND);

      const harAvklaring = soknadsland.some(land => land.fakta.includes('TRUE'));
      return ({
        harAvklaring,
      });
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }

  static harMinstEttGyldigSoknadsland = avklartefakta => avklartefakta
    .some(enkeltFakta => ((enkeltFakta.referanse === KV.Koder.SOKNADSLAND) && enkeltFakta.fakta.includes('TRUE')));
}

export default Inngang;
