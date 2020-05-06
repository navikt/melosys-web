import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingVurderarbeidsland from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingVurderarbeidsland';

import * as Utils from '../../../utils';
import * as KV from '../../../kodeverk';
import MKV from '../../../melosyskodeverk';
import { hentFakta, hentFaktaListe, hentFaktaVerdi } from '../../../regler/avklartefakta';

class Vurderarbeidsland extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const sokkelEllerSkipListe = hentFaktaListe(KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP, propsLight.avklartefakta);
    const installasjonArbeidslandListe = hentFaktaListe(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, propsLight.avklartefakta);
    const arbeidUtforesIOppgittLandFakta = hentFakta(KV.Koder.avklartefaktaKoder.ARBEID_UTFORES_I_OPPGITT_LAND, propsLight.avklartefakta);
    const fjernetArbeidslandFakta = hentFaktaListe(KV.Koder.avklartefaktaKoder.FJERNET_ARBEIDSLAND, propsLight.avklartefakta);
    const arbeidslandFaktaListe = hentFaktaListe(MKV.Koder.avklartefaktatyper.ARBEIDSLAND, propsLight.avklartefakta);
    const harIngenSokkelSkipEllerHjemmebase = this.harIngenSokkelEllerHjemmebase(sokkelEllerSkipListe, propsLight.hjemmebase);

    const harAvklaring = this.harAvklaring({
      arbeidUtforesIOppgittLandFakta,
      sokkelEllerSkipListe,
      installasjonArbeidslandListe,
      maritimtarbeid: propsLight.maritimtarbeid,
      harIngenSokkelSkipEllerHjemmebase,
    });

    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.YRKESAKTIVITET,
      },
    ];
    this.id = STEG.VURDER_ARBEIDSLAND;
    this.tittel = 'Vurder arbeidsland';
    this.komponent = VurderingVurderarbeidsland;
    this.samleRelevanteData = _propsLight => ({
      begrunnelser: _propsLight.begrunnelser.sokkel,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const installasjonArbeidslandTypeListe = hentFaktaListe(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND_TYPE, _propsLight.avklartefakta);
      const arbeidslandListe = hentFaktaListe(MKV.Koder.avklartefaktatyper.ARBEIDSLAND, _propsLight.avklartefakta);

      return ({
        harAvklaring,
        sokkelEllerSkipListe,
        installasjonArbeidslandListe,
        installasjonArbeidslandTypeListe,
        arbeidslandListe,
        arbeidUtforesIOppgittLandFakta,
        fjernetArbeidslandFakta,
        harIngenSokkelSkipEllerHjemmebase,
        arbeidslandFaktaListe,
      });
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }

  harAvklaring = ({
    arbeidUtforesIOppgittLandFakta,
    sokkelEllerSkipListe,
    installasjonArbeidslandListe,
    maritimtarbeid,
    harIngenSokkelSkipEllerHjemmebase,
  }) => {
    const arbeidUtforesIOppgittLand = this.erArbeidUtforesIOppgittLandAvklart(arbeidUtforesIOppgittLandFakta);
    const erSokkelSkipAvklart = this.erSokkelSkipAvklart(sokkelEllerSkipListe, installasjonArbeidslandListe, maritimtarbeid);

    return harIngenSokkelSkipEllerHjemmebase ? arbeidUtforesIOppgittLand : erSokkelSkipAvklart;
  };

  erSokkelSkipAvklart = (sokkelEllerSkipListe, installasjonArbeidslandListe, maritimtarbeid) => {
    if (maritimtarbeid.length === 0) {
      return true;
    }

    if (sokkelEllerSkipListe.length === 0) {
      return false;
    }

    return sokkelEllerSkipListe.every(sokkelEllerSkip => {
      if (!installasjonArbeidslandListe.find(land => land.subjektID === sokkelEllerSkip.subjektID)) {
        return false;
      }

      const installasjonsType = hentFaktaVerdi(sokkelEllerSkip);
      if (installasjonsType === KV.Koder.SOKKEL) {
        return sokkelEllerSkip.begrunnelseKoder.length > 0;
      }

      return true;
    });
  }

  erArbeidUtforesIOppgittLandAvklart = arbeidUtforesIOppgittLandFakta => (
    Boolean(hentFaktaVerdi(arbeidUtforesIOppgittLandFakta))
  );

  harIngenSokkelEllerHjemmebase = (sokkelEllerSkipListe, hjemmebase) => (
    sokkelEllerSkipListe.length === 0 && Utils._isEmpty(hjemmebase)
  )
}

export default Vurderarbeidsland;
