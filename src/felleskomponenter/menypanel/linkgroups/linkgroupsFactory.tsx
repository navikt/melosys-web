import MKV from "../../../melosyskodeverk";

import { skalViseTomFlytEllerErSedBehandling } from "../../../routing";
import { LinkGroup, ContentProps } from "./types";
import LinkgroupsBuilder from "./linkgroupsBuilder";
import LinksBuilder from "./linksBuilder";

const {
  UTSENDT_ARBEIDSTAKER,
  UTSENDT_SELVSTENDIG,
  ARBEID_FLERE_LAND,
  ARBEID_ETT_LAND_ØVRIG,
  ARBEID_TJENESTEPERSON_ELLER_FLY,
  ARBEID_KUN_NORGE,
  ARBEID_NORGE_BOSATT_ANNET_LAND,
  REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING,
  REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE,
  ANMODNING_OM_UNNTAK_HOVEDREGEL,
  BESLUTNING_LOVVALG_NORGE,
  BESLUTNING_LOVVALG_ANNET_LAND,
  ARBEID_I_UTLANDET,
  YRKESAKTIV,
} = MKV.Koder.behandlinger.behandlingstema;

const { SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS } = MKV.Koder.behandlingsgrunnlagtyper;

interface LinkGroupsConfig {
  sakstype: string;
  behandlingstema: string;
  behandlingstype: string;
  behandlingsgrunnlagtype: string;
  contentProps: ContentProps;
  sakstema: string;
}

class LinkGroupsFactory {
  static createLinkGroups({
    contentProps,
    behandlingsgrunnlagtype,
    sakstype,
    behandlingstema,
    behandlingstype,
    sakstema,
  }: LinkGroupsConfig): LinkGroup[] {
    if (skalViseTomFlytEllerErSedBehandling(sakstype, sakstema, behandlingstema, behandlingstype))
      return new LinkgroupsBuilder().addUtenLabel(new LinksBuilder(contentProps).addFullmektig().build()).build();

    switch (behandlingstema) {
      case UTSENDT_ARBEIDSTAKER:
      case UTSENDT_SELVSTENDIG:
      case ARBEID_FLERE_LAND:
      case ARBEID_ETT_LAND_ØVRIG:
      case ARBEID_TJENESTEPERSON_ELLER_FLY:
      case ARBEID_KUN_NORGE:
      case ARBEID_NORGE_BOSATT_ANNET_LAND: {
        const fraBruker = new LinksBuilder(contentProps).addArbeidsgiverEllerVirksomhet();
        if (behandlingsgrunnlagtype === SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS) fraBruker.addLonnOgGodtgjorelser();
        fraBruker.addFullmektig();
        if (behandlingsgrunnlagtype === SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS) fraBruker.addUtenlandsoppdraget();
        else fraBruker.addPeriode();
        fraBruker.addArbeidssteder();
        if (behandlingsgrunnlagtype === SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS) {
          fraBruker.addOmVirksomhetenINorge();
          fraBruker.addOvrigOmArbeidstaker();
        }

        return new LinkgroupsBuilder()
          .addFraRegisterOgBruker(new LinksBuilder(contentProps).addPerson().addFamilieForhold().build())
          .addFraRegister(
            new LinksBuilder(contentProps).addMedlemskap().addEUEOSBarnetrygd().addArbeidsforholdOgInntekt().build()
          )
          .addFraBruker(fraBruker.build())
          .build();
      }
      case REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING:
      case REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE: {
        return new LinkgroupsBuilder()
          .addFraRegister(
            new LinksBuilder(contentProps).addPerson().addFamilieForhold().addMedlemskap().addEUEOSBarnetrygd().build()
          )
          .build();
      }
      case BESLUTNING_LOVVALG_ANNET_LAND:
      case ANMODNING_OM_UNNTAK_HOVEDREGEL: {
        return new LinkgroupsBuilder()
          .addFraRegister(
            new LinksBuilder(contentProps)
              .addPerson()
              .addFamilieForhold()
              .addMedlemskap()
              .addEUEOSBarnetrygd()
              .addArbeidsforholdOgInntekt()
              .build()
          )
          .build();
      }
      case BESLUTNING_LOVVALG_NORGE: {
        return new LinkgroupsBuilder()
          .addFraRegisterOgBruker(new LinksBuilder(contentProps).addPerson().addFamilieForhold().build())
          .addFraRegister(
            new LinksBuilder(contentProps).addMedlemskap().addEUEOSBarnetrygd().addArbeidsforholdOgInntekt().build()
          )
          .addFraBruker(
            new LinksBuilder(contentProps)
              .addArbeidsgiverEllerVirksomhet()
              .addFullmektig()
              .addPeriode()
              .addArbeidssteder()
              .build()
          )
          .build();
      }
      case YRKESAKTIV: {
        return new LinkgroupsBuilder()
          .addFraRegisterOgBruker(new LinksBuilder(contentProps).addPerson().addFamilieForhold().build())
          .addFraRegister(
            new LinksBuilder(contentProps).addMedlemskap().addEUEOSBarnetrygd().addArbeidsforholdOgInntekt().build()
          )
          .addFraBruker(
            new LinksBuilder(contentProps).addArbeidsgiverEllerVirksomhet().addFullmektig().addArbeidssteder().build()
          )
          .build();
      }
      case ARBEID_I_UTLANDET: {
        return new LinkgroupsBuilder()
          .addFraRegisterOgBruker(new LinksBuilder(contentProps).addPerson().addFamilieForhold().build())
          .addFraRegister(
            new LinksBuilder(contentProps).addMedlemskap().addEUEOSBarnetrygd().addArbeidsforholdOgInntekt().build()
          )
          .addFraBruker(new LinksBuilder(contentProps).addArbeidsgiverEllerVirksomhet().addFullmektig().build())
          .build();
      }
      default:
        return [];
    }
  }
}

export default LinkGroupsFactory;
