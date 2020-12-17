import MKV from '../../../melosyskodeverk';

import { LinkGroup, ContentProps } from './types';
import LinkgroupsBuilder from './linkgroupsBuilder';
import LinksBuilder from './linksBuilder';

const {
  UTSENDT_ARBEIDSTAKER,
  UTSENDT_SELVSTENDIG,
  ARBEID_FLERE_LAND,
  IKKE_YRKESAKTIV,
  ARBEID_ETT_LAND_ØVRIG,
  ARBEID_NORGE_BOSATT_ANNET_LAND,
  REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING,
  REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE,
  ANMODNING_OM_UNNTAK_HOVEDREGEL,
  BESLUTNING_LOVVALG_NORGE,
  BESLUTNING_LOVVALG_ANNET_LAND,
  ØVRIGE_SED_MED,
  ØVRIGE_SED_UFM,
  TRYGDETID,
} = MKV.Koder.behandlinger.behandlingstema;

export interface LinkGroupsFactoryConfig {
  behandlingstema: string,
  contentProps: ContentProps,
}

class LinkGroupsFactory {
  private readonly config: LinkGroupsFactoryConfig;

  constructor(config: LinkGroupsFactoryConfig) {
    this.config = config;
  }

  createLinkGroups(): LinkGroup[] {
    const {
      behandlingstema,
      contentProps,
    } = this.config;

    switch (behandlingstema) {
      case UTSENDT_ARBEIDSTAKER:
      case UTSENDT_SELVSTENDIG:
      case ARBEID_FLERE_LAND:
      case IKKE_YRKESAKTIV:
      case ARBEID_ETT_LAND_ØVRIG:
      case ARBEID_NORGE_BOSATT_ANNET_LAND: {
        return new LinkgroupsBuilder()
          .addFraRegisterOgSoknad(new LinksBuilder(contentProps)
            .addPerson()
            .addFamilieForhold()
            .build())
          .addFraRegister(new LinksBuilder(contentProps)
            .addMedlemskap()
            .addEUEOSBarnetrygd()
            .addArbeidsforholdOgInntekt()
            .build())
          .addFraSoknad(new LinksBuilder(contentProps)
            .addArbeidsgiverEllervirksomhet()
            .addFullmektig()
            .addPeriode()
            .addArbeidssteder()
            .build())
          .build();
      }
      case BESLUTNING_LOVVALG_ANNET_LAND:
      case REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING:
      case REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE:
      case ANMODNING_OM_UNNTAK_HOVEDREGEL:
      case ØVRIGE_SED_MED:
      case ØVRIGE_SED_UFM:
      case TRYGDETID: {
        return new LinkgroupsBuilder()
          .addFraRegister(new LinksBuilder(contentProps)
            .addPerson()
            .addFamilieForhold()
            .addMedlemskap()
            .addEUEOSBarnetrygd()
            .addArbeidsforholdOgInntekt()
            .build())
          .build();
      }
      case BESLUTNING_LOVVALG_NORGE: {
        return new LinkgroupsBuilder()
          .addFraRegisterOgSED(new LinksBuilder(contentProps)
            .addPerson()
            .addFamilieForhold()
            .build())
          .addFraRegister(new LinksBuilder(contentProps)
            .addMedlemskap()
            .addEUEOSBarnetrygd()
            .addArbeidsforholdOgInntekt()
            .build())
          .addFraSED(new LinksBuilder(contentProps)
            .addArbeidsgiverEllervirksomhet()
            .addFullmektig()
            .addPeriode()
            .addArbeidssteder()
            .build())
          .build();
      }
      default:
        return [];
    }
  }
}

export default LinkGroupsFactory;
