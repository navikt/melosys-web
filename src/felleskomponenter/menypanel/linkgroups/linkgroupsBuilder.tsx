import { Link, LinkGroup } from "./types";

interface ILinkGroupsBuilder {
  addFraRegister: (links: Link[]) => ILinkGroupsBuilder;
  addFraRegisterOgBruker: (links: Link[]) => ILinkGroupsBuilder;
  addFraRegisterOgSED: (links: Link[]) => ILinkGroupsBuilder;
  addFraBruker: (links: Link[]) => ILinkGroupsBuilder;
  build: () => LinkGroup[];
}

class LinkGroupsBuilder implements ILinkGroupsBuilder {
  private readonly linkGroups: LinkGroup[] = [];

  public addFraRegisterOgBruker(links: Link[]) {
    this.linkGroups.push({
      label: "FRA REGISTER OG BRUKER",
      links,
    });
    return this;
  }

  public addFraRegisterOgSED(links: Link[]) {
    this.linkGroups.push({
      label: "FRA REGISTER OG SED",
      links,
    });
    return this;
  }

  public addFraRegister(links: Link[]) {
    this.linkGroups.push({
      label: "FRA REGISTER",
      links,
    });
    return this;
  }

  public addFraBruker(links: Link[]) {
    this.linkGroups.push({
      label: "FRA BRUKER",
      links,
    });
    return this;
  }

  public build() {
    return this.linkGroups;
  }
}

export default LinkGroupsBuilder;
