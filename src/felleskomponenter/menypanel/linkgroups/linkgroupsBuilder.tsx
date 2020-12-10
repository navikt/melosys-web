import { Link, LinkGroup } from './types';

interface ILinkGroupsBuilder {
  addFraRegister: (links: Link[]) => ILinkGroupsBuilder,
  addFraRegisterOgSoknad: (links: Link[]) => ILinkGroupsBuilder,
  addFraRegisterOgSED: (links: Link[]) => ILinkGroupsBuilder,
  addFraSoknad: (links: Link[]) => ILinkGroupsBuilder,
  addFraSED: (links: Link[]) => ILinkGroupsBuilder,
  build: () => LinkGroup[],
}

class LinkGroupsBuilder implements ILinkGroupsBuilder {
  private readonly linkGroups: LinkGroup[] = [];

  public addFraRegisterOgSoknad(links: Link[]) {
    this.linkGroups.push({
      label: 'FRA REGISTER OG SØKNAD',
      links,
    });
    return this;
  }

  public addFraRegisterOgSED(links: Link[]) {
    this.linkGroups.push({
      label: 'FRA REGISTER OG SED',
      links,
    });
    return this;
  }


  public addFraRegister(links: Link[]) {
    this.linkGroups.push({
      label: 'FRA REGISTER',
      links,
    });
    return this;
  }

  public addFraSoknad(links: Link[]) {
    this.linkGroups.push({
      label: 'FRA SØKNAD',
      links,
    });
    return this;
  }

  public addFraSED(links: Link[]) {
    this.linkGroups.push({
      label: 'FRA SED',
      links,
    });
    return this;
  }

  public build() {
    return this.linkGroups;
  }
}

export default LinkGroupsBuilder;
