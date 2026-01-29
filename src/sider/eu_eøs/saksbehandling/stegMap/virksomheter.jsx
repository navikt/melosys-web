import { Virksomheter } from "../../stegMap";
import { STEG } from "../../../../felleskomponenter/stegvelger";
import * as KV from "../../../../kodeverk";
import MKV from "../../../../melosyskodeverk";

import SokkelSkip from "./sokkel_skip";
import Yrkesgruppe from "./yrkesgruppe";
import { hentFaktaListe } from "../../../../domeneUtils";
import { BOOLSK_STRING } from "../../../../constants";

class SaksbehandlingVirksomheter extends Virksomheter {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const harValgtArbeidsgiver = Virksomheter.harValgtArbeidsgiver(propsLight.avklartefakta);
    const arbeiderPaSokkelEllerSkip = Virksomheter.finnAvklaring(
      propsLight.avklartefakta,
      KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP,
    );
    const gårDirekteTilArtikkel16 = Yrkesgruppe.finnAvklaring(
      propsLight.avklartefakta,
      KV.Koder.VurderingYrkesgruppeTyper.ORDINAER_UTEN_ART12,
    );

    const arbeidslandErNorge = propsLight.arbeidsland[0]?.kode === MKV.Koder.landkoder.NO;

    const erUtsendtOgArbeidslandNorge =
      [
        MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
        MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG,
      ].includes(propsLight.behandlingstema.kode) && arbeidslandErNorge;

    const erArbeidKunNorge =
      MKV.Koder.behandlinger.behandlingstema.ARBEID_KUN_NORGE === propsLight.behandlingstema.kode;

    const harAvklaring = (vurderingLovvalgBarnFakta, mottatteOpplysningerMedfolgendeBarn) => {
      return (
        !(vurderingLovvalgBarnFakta.length === 0 && mottatteOpplysningerMedfolgendeBarn.length === 0) ||
        (vurderingLovvalgBarnFakta.length === mottatteOpplysningerMedfolgendeBarn.length &&
          vurderingLovvalgBarnFakta.every(
            (enkeltFakta) =>
              enkeltFakta.fakta.includes(BOOLSK_STRING.SANN) ||
              (enkeltFakta.fakta.includes(BOOLSK_STRING.USANN) && enkeltFakta.begrunnelseKoder.length > 0),
          ))
      );
    };

    const beregnNesteStegForFlyt11_3_b = (propsLight) => {
      const vurderingLovvalgBarnFakta = hentFaktaListe(
        MKV.Koder.avklartefaktatyper.VURDERING_LOVVALG_BARN,
        propsLight.avklartefakta,
      );

      const harAvklaringBarn = harAvklaring(vurderingLovvalgBarnFakta, propsLight.medfolgendeBarn);
      const erInnsynsmodus = !propsLight.generiskStegRedigerbart;
      if (harAvklaringBarn && erInnsynsmodus) {
        return STEG.MEDFOLGENDE_BARN;
      }

      const oppsummering = propsLight.oppsummering;
      const flytProduksjonDato = new Date("2025-11-15T00:00:00Z");

      const behandlingAvsluttetFørNyEndringEØS_11_3_b =
        oppsummering.behandlingsstatus.kode === "AVSLUTTET" && new Date(oppsummering.endretDato) < flytProduksjonDato;

      const innsynsmodusSkalIkkeViseEndringerFraFaktureringAvTrygdeavgift =
        !propsLight.generiskStegRedigerbart && behandlingAvsluttetFørNyEndringEØS_11_3_b;

      if (propsLight.eøsFaktureringAvTrygdeavgiftToggleEnabled) {
        if (innsynsmodusSkalIkkeViseEndringerFraFaktureringAvTrygdeavgift) {
          return STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK;
        }

        return STEG.VURDERING_PERIODE;
      }

      return STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK;
    };

    const NESTE_STEG_FOR_11_3_b = beregnNesteStegForFlyt11_3_b(propsLight);

    this.kriterier = [
      {
        exec: (avklartefakta) => {
          const erSkipEttLand = SokkelSkip.finnAvklaring(
            avklartefakta,
            KV.Koder.VurderingSokkelSkipTyper.SKIP_ETT_LAND,
          );
          return harValgtArbeidsgiver && arbeiderPaSokkelEllerSkip && erSkipEttLand;
        },
        nesteSteg: STEG.BOSTEDSLAND,
      },
      {
        exec: () => harValgtArbeidsgiver && gårDirekteTilArtikkel16 && propsLight.unntaksvilkår?.oppfylt,
        nesteSteg: STEG.ARTIKKEL_16_ANMODNING,
      },
      {
        exec: () => {
          return harValgtArbeidsgiver && (erUtsendtOgArbeidslandNorge || erArbeidKunNorge);
        },
        nesteSteg: STEG.VEDTAK,
      },
      {
        exec: () => harValgtArbeidsgiver && (gårDirekteTilArtikkel16 || propsLight.erArbeidTjenestepersonEllerFly),
        nesteSteg: NESTE_STEG_FOR_11_3_b,
      },
      {
        exec: () => {
          const erToEllerFlereLand = propsLight.erSoknadArbeidFlereLand;

          return harValgtArbeidsgiver && erToEllerFlereLand;
        },
        nesteSteg: STEG.VURDER_ARBEIDSLAND,
      },
      {
        exec: (avklartefakta) => {
          const erVanligYrkesaktiv = Virksomheter.finnAvklaring(
            avklartefakta,
            KV.Koder.VurderingYrkesgruppeTyper.ORDINAER,
          );
          const erFlyendePersonell = Virksomheter.finnAvklaring(
            avklartefakta,
            KV.Koder.VurderingYrkesgruppeTyper.FLYENDE_PERSONELL,
          );
          const erSokkelUtland = SokkelSkip.finnAvklaring(
            avklartefakta,
            KV.Koder.VurderingSokkelSkipTyper.SOKKEL_UTLAND,
          );

          return (
            harValgtArbeidsgiver &&
            (erVanligYrkesaktiv || erFlyendePersonell || (arbeiderPaSokkelEllerSkip && erSokkelUtland))
          );
        },
        nesteSteg: STEG.YRKESAKTIVITET,
      },
    ];
  }
}

export default SaksbehandlingVirksomheter;
