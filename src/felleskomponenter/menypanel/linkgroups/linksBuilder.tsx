import { Link, ContentProps } from "./types";

import {
  ArbeidsforholdOgInntekt,
  ArbeidsgiverOgVirksomhet,
  Arbeidssteder,
  Fullmektig,
  Medlemskap,
  Utenlandsoppdraget,
  Periode,
  Person,
  Familieforhold,
  LonnOgGodtgjorelser,
  OvrigOmArbeidstaker,
  VirksomhetenINorge,
} from "../menypunkter";
import Fakturainformasjon from "../menypunkter/fakturainformasjon";
import Pensjonsopptjening from "../../pensjonsopptjening";

interface ILinksBuilder {
  addPerson: () => ILinksBuilder;
  addFamilieForhold: () => ILinksBuilder;
  addMedlemskap: () => ILinksBuilder;
  addArbeidsforholdOgInntekt: () => ILinksBuilder;
  addPensjonsopptjening: () => ILinksBuilder;
  addArbeidsgiverEllerVirksomhet: () => ILinksBuilder;
  addFullmektig: () => ILinksBuilder;
  addPeriode: () => ILinksBuilder;
  addUtenlandsoppdraget: () => ILinksBuilder;
  addLonnOgGodtgjorelser: () => ILinksBuilder;
  addArbeidssteder: () => ILinksBuilder;
  addOvrigOmArbeidstaker: () => ILinksBuilder;
  addOmVirksomhetenINorge: () => ILinksBuilder;
  build: () => Link[];
}

class LinksBuilder implements ILinksBuilder {
  private readonly links: Link[] = [];

  private readonly contentProps: ContentProps;

  constructor(props: ContentProps) {
    this.contentProps = props;
  }

  public addPerson() {
    this.links.push({
      label: "Person",
      active: false,
      content: (
        <Person
          visArbeidsforholdRolleEtiketter={this.contentProps.visArbeidsforholdRolleEtiketter}
          endreFokus={this.contentProps.endreFokus}
          visMottatteOpplysningerData={this.contentProps.visMottatteOpplysningerData}
        />
      ),
    });
    return this;
  }

  public addFamilieForhold() {
    this.links.push({
      label: "Familieforhold",
      active: false,
      content: (
        <Familieforhold
          visArbeidsforholdRolleEtiketter={this.contentProps.visArbeidsforholdRolleEtiketter}
          redigerbart={this.contentProps.redigerbart}
          visMottatteOpplysningerData={this.contentProps.visMottatteOpplysningerData}
          behandlingstema={this.contentProps.behandlingstema}
        />
      ),
    });
    return this;
  }

  public addMedlemskap() {
    this.links.push({
      label: "Medlemskap",
      active: false,
      content: <Medlemskap />,
    });
    return this;
  }

  public addArbeidsforholdOgInntekt() {
    this.links.push({
      label: "Arbeidsforhold og inntekt",
      active: false,
      content: <ArbeidsforholdOgInntekt />,
    });
    return this;
  }

  public addPensjonsopptjening() {
    this.links.push({
      label: "Pensjonsopptjening",
      active: false,
      content: <Pensjonsopptjening />,
    });
    return this;
  }

  public addFaktureringskomponenten() {
    this.links.push({
      label: "Fakturainformasjon",
      active: false,
      content: <Fakturainformasjon />,
    });
    return this;
  }

  public addArbeidsgiverEllerVirksomhet() {
    this.links.push({
      label: "Arbeidsgiver/virksomhet",
      active: false,
      content: (
        <ArbeidsgiverOgVirksomhet
          visArbeidsforholdRolleEtiketter={this.contentProps.visArbeidsforholdRolleEtiketter}
          redigerbart={this.contentProps.redigerbart}
        />
      ),
    });
    return this;
  }

  public addFullmektig() {
    this.links.push({
      label: "Fullmektig",
      active: false,
      content: (
        <Fullmektig
          visArbeidsforholdRolleEtiketter={this.contentProps.visArbeidsforholdRolleEtiketter}
          redigerbart={this.contentProps.redigerbart}
        />
      ),
    });
    return this;
  }

  public addPeriode() {
    this.links.push({
      label: "Periode og land",
      active: false,
      content: (
        <Periode
          visArbeidsforholdRolleEtiketter={this.contentProps.visArbeidsforholdRolleEtiketter}
          redigerbart={this.contentProps.redigerbart}
          lagreSoknadOgOppfriskSaksopplysninger={this.contentProps.lagreSoknadOgOppfriskSaksopplysninger}
        />
      ),
    });
    return this;
  }

  public addUtenlandsoppdraget() {
    this.links.push({
      label: "Utenlandsoppdraget",
      active: false,
      content: (
        <Utenlandsoppdraget
          visArbeidsforholdRolleEtiketter={this.contentProps.visArbeidsforholdRolleEtiketter}
          redigerbart={this.contentProps.redigerbart}
          lagreSoknadOgOppfriskSaksopplysninger={this.contentProps.lagreSoknadOgOppfriskSaksopplysninger}
        />
      ),
    });
    return this;
  }

  public addArbeidssteder() {
    this.links.push({
      label: "Arbeidssted(er)",
      active: false,
      content: (
        <Arbeidssteder
          visArbeidsforholdRolleEtiketter={this.contentProps.visArbeidsforholdRolleEtiketter}
          redigerbart={this.contentProps.redigerbart}
          behandlingstema={this.contentProps.behandlingstema}
        />
      ),
    });
    return this;
  }

  public addLonnOgGodtgjorelser() {
    this.links.push({
      label: "Lønn og godtgjørelser",
      active: false,
      content: (
        <LonnOgGodtgjorelser
          visArbeidsforholdRolleEtiketter={this.contentProps.visArbeidsforholdRolleEtiketter}
          redigerbart={this.contentProps.redigerbart}
        />
      ),
    });
    return this;
  }

  public addOvrigOmArbeidstaker() {
    this.links.push({
      label: "Øvrig om arbeidstaker",
      active: false,
      content: (
        <OvrigOmArbeidstaker
          visArbeidsforholdRolleEtiketter={this.contentProps.visArbeidsforholdRolleEtiketter}
          redigerbart={this.contentProps.redigerbart}
        />
      ),
    });
    return this;
  }

  public addOmVirksomhetenINorge() {
    this.links.push({
      label: "Om virksomheten i Norge",
      active: false,
      content: (
        <VirksomhetenINorge
          redigerbart={this.contentProps.redigerbart}
          visArbeidsforholdRolleEtiketter={this.contentProps.visArbeidsforholdRolleEtiketter}
        />
      ),
    });
    return this;
  }

  public build() {
    return this.links;
  }
}

export default LinksBuilder;
