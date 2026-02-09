import MKV from "../../../melosyskodeverk";

import { harUnntaksregistreringFlyt, skalViseIngenFlyt } from "../../../url";
import { ContentProps, LinkGroup } from "./types";
import LinkgroupsBuilder from "./linkgroupsBuilder";
import LinksBuilder from "./linksBuilder";
import { MELOSYS_EØS_FAKTURERING_AV_TRYGDEAVGIFT } from "../../../featuretoggle/toggleNavn";
import { useFeatureToggle } from "../../../featuretoggle";

const {
  UTSENDT_ARBEIDSTAKER,
  UTSENDT_SELVSTENDIG,
  ARBEID_FLERE_LAND,
  ARBEID_KUN_NORGE,
  ARBEID_TJENESTEPERSON_ELLER_FLY,
  ARBEID_NORGE_BOSATT_ANNET_LAND,
  REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING,
  REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE,
  ANMODNING_OM_UNNTAK_HOVEDREGEL,
  BESLUTNING_LOVVALG_NORGE,
  BESLUTNING_LOVVALG_ANNET_LAND,
  YRKESAKTIV,
  IKKE_YRKESAKTIV,
  PENSJONIST,
} = MKV.Koder.behandlinger.behandlingstema;

const { SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS } = MKV.Koder.mottatteopplysningertyper;
const { ÅRSAVREGNING } = MKV.Koder.behandlinger.behandlingstyper;

interface LinkGroupsConfig {
  sakstype: string;
  behandlingstema: string;
  behandlingstype: string;
  mottatteOpplysningerType: string;
  contentProps: ContentProps;
  sakstema: string;
  kunFullmektig?: boolean;
  erPensjonistToggleEnabled: boolean | undefined;
  erPensjonistEØSToggleEnabled: boolean | undefined;
}

class LinkGroupsFactory {
  static createLinkGroups({
    contentProps,
    mottatteOpplysningerType,
    sakstype,
    behandlingstema,
    behandlingstype,
    sakstema,
    kunFullmektig,
    erPensjonistToggleEnabled,
    erPensjonistEØSToggleEnabled,
  }: LinkGroupsConfig): LinkGroup[] {
    if (
      skalViseIngenFlyt(
        sakstype,
        sakstema,
        behandlingstema,
        behandlingstype,
        erPensjonistToggleEnabled,
        erPensjonistEØSToggleEnabled,
      ) ||
      kunFullmektig
    ) {
      return new LinkgroupsBuilder().addUtenLabel(new LinksBuilder(contentProps).addFullmektig().build()).build();
    }

    if (harUnntaksregistreringFlyt(sakstype, sakstema, behandlingstema)) {
      return new LinkgroupsBuilder()
        .addFraRegister(
          new LinksBuilder(contentProps)
            .addPerson()
            .addFamilieForhold()
            .addMedlemskap()
            .addArbeidsforholdOgInntekt()
            .build(),
        )
        .build();
    }

    if (behandlingstema === PENSJONIST) {
      return new LinkgroupsBuilder()
        .addFraRegister(
          new LinksBuilder(contentProps)
            .addPerson()
            .addFamilieForhold()
            .addMedlemskap()
            .addArbeidsforholdOgInntekt()
            .addFaktureringskomponenten()
            .build(),
        )
        .addFraBruker(new LinksBuilder(contentProps).addFullmektig().build())
        .build();
    }

    if (behandlingstema === IKKE_YRKESAKTIV) {
      return new LinkgroupsBuilder()
        .addFraRegister(
          new LinksBuilder(contentProps)
            .addPerson()
            .addFamilieForhold()
            .addMedlemskap()
            .addArbeidsforholdOgInntekt()
            .build(),
        )
        .addFraBruker(new LinksBuilder(contentProps).addFullmektig().build())
        .build();
    }

    switch (behandlingstema) {
      case UTSENDT_ARBEIDSTAKER:
      case UTSENDT_SELVSTENDIG:
      case ARBEID_FLERE_LAND:
      case ARBEID_KUN_NORGE:
      case ARBEID_TJENESTEPERSON_ELLER_FLY:
      case ARBEID_NORGE_BOSATT_ANNET_LAND: {
        const fraBruker = new LinksBuilder(contentProps);
        if (behandlingstype !== ÅRSAVREGNING) fraBruker.addArbeidsgiverEllerVirksomhet();
        const fraRegister = new LinksBuilder(contentProps).addMedlemskap().addArbeidsforholdOgInntekt();
        if (mottatteOpplysningerType === SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS) fraBruker.addLonnOgGodtgjorelser();
        fraBruker.addFullmektig();
        if (mottatteOpplysningerType === SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS) fraBruker.addUtenlandsoppdraget();
        else fraBruker.addPeriode();
        if (behandlingstype !== ÅRSAVREGNING) fraBruker.addArbeidssteder();
        if (mottatteOpplysningerType === SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS) {
          fraBruker.addOmVirksomhetenINorge();
          fraBruker.addOvrigOmArbeidstaker();
        }
        if (
          behandlingstema === ARBEID_TJENESTEPERSON_ELLER_FLY &&
          useFeatureToggle(MELOSYS_EØS_FAKTURERING_AV_TRYGDEAVGIFT)
        ) {
          fraRegister.addFaktureringskomponenten();
        }

        return new LinkgroupsBuilder()
          .addFraRegisterOgBruker(new LinksBuilder(contentProps).addPerson().addFamilieForhold().build())
          .addFraRegister(fraRegister.build())
          .addFraBruker(fraBruker.build())
          .build();
      }
      case REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING:
      case REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE: {
        return new LinkgroupsBuilder()
          .addFraRegister(new LinksBuilder(contentProps).addPerson().addFamilieForhold().addMedlemskap().build())
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
              .addArbeidsforholdOgInntekt()
              .build(),
          )
          .build();
      }
      case BESLUTNING_LOVVALG_NORGE: {
        return new LinkgroupsBuilder()
          .addFraRegisterOgBruker(new LinksBuilder(contentProps).addPerson().addFamilieForhold().build())
          .addFraRegister(new LinksBuilder(contentProps).addMedlemskap().addArbeidsforholdOgInntekt().build())
          .addFraBruker(
            new LinksBuilder(contentProps)
              .addArbeidsgiverEllerVirksomhet()
              .addFullmektig()
              .addPeriode()
              .addArbeidssteder()
              .build(),
          )
          .build();
      }
      case YRKESAKTIV: {
        const fraBrukerBuilder = new LinksBuilder(contentProps);
        if (behandlingstype !== ÅRSAVREGNING) fraBrukerBuilder.addArbeidsgiverEllerVirksomhet();
        fraBrukerBuilder.addFullmektig();
        if (behandlingstype !== ÅRSAVREGNING) fraBrukerBuilder.addArbeidssteder();
        return new LinkgroupsBuilder()
          .addFraRegisterOgBruker(new LinksBuilder(contentProps).addPerson().addFamilieForhold().build())
          .addFraRegister(
            new LinksBuilder(contentProps)
              .addMedlemskap()
              .addArbeidsforholdOgInntekt()
              .addFaktureringskomponenten()
              .build(),
          )
          .addFraBruker(fraBrukerBuilder.build())
          .build();
      }
      default:
        return [];
    }
  }
}

export default LinkGroupsFactory;
