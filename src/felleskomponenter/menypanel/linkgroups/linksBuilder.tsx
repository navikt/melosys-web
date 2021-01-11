import React from "react";

import { Link, ContentProps } from "./types";

import {
  ArbeidsforholdOgInntekt,
  ArbeidsgiverOgVirksomhet,
  Arbeidssteder,
  Barnetrygd,
  Fullmektig,
  Medlemskap,
  Periode,
  Person,
  Familieforhold,
} from "../menypunkter";

interface ILinksBuilder {
  addPerson: () => ILinksBuilder;
  addFamilieForhold: () => ILinksBuilder;
  addMedlemskap: () => ILinksBuilder;
  addEUEOSBarnetrygd: () => ILinksBuilder;
  addArbeidsforholdOgInntekt: () => ILinksBuilder;
  addArbeidsgiverEllerVirksomhet: () => ILinksBuilder;
  addFullmektig: () => ILinksBuilder;
  addPeriode: () => ILinksBuilder;
  // addUtenlandsoppdraget: () => ILinksBuilder,
  // addLonnOgGodtgjorelser: () => ILinksBuilder,
  addArbeidssteder: () => ILinksBuilder;
  // addOmVirksomhetenINorge: () => ILinksBuilder,
  // addOvrigOmArbeidstaker: () => ILinksBuilder,
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
          redigerbart={this.contentProps.redigerbart}
          behandlingsgrunnlagEtikett={this.contentProps.behandlingsgrunnlagEtikett}
          visBehandlingsgrunnlagData={this.contentProps.visBehandlingsgrunnlagData}
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
          behandlingsgrunnlagEtikett={this.contentProps.behandlingsgrunnlagEtikett}
          visBehandlingsgrunnlagData={this.contentProps.visBehandlingsgrunnlagData}
          setMenypanelFeilmelding={this.contentProps.setMenypanelFeilmelding}
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

  public addEUEOSBarnetrygd() {
    this.links.push({
      label: "EU/EØS-barnetrygd",
      active: false,
      content: <Barnetrygd />,
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

  public addArbeidsgiverEllerVirksomhet() {
    this.links.push({
      label: "Arbeidsgiver/virksomhet",
      active: false,
      content: (
        <ArbeidsgiverOgVirksomhet
          visArbeidsforholdRolleEtiketter={this.contentProps.visArbeidsforholdRolleEtiketter}
          redigerbart={this.contentProps.redigerbart}
          behandlingsgrunnlagEtikett={this.contentProps.behandlingsgrunnlagEtikett}
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
          behandlingsgrunnlagEtikett={this.contentProps.behandlingsgrunnlagEtikett}
        />
      ),
    });
    return this;
  }

  public addPeriode() {
    this.links.push({
      label: "Periode",
      active: false,
      content: (
        <Periode
          visArbeidsforholdRolleEtiketter={this.contentProps.visArbeidsforholdRolleEtiketter}
          redigerbart={this.contentProps.redigerbart}
          lagreSoknadOgOppfriskSaksopplysninger={this.contentProps.lagreSoknadOgOppfriskSaksopplysninger}
          behandlingsgrunnlagEtikett={this.contentProps.behandlingsgrunnlagEtikett}
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
          behandlingsgrunnlagEtikett={this.contentProps.behandlingsgrunnlagEtikett}
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
