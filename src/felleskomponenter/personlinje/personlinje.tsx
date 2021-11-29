import React from "react";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";

import { behandlingerSelectors } from "../../ducks/behandlinger";

import * as Ikon from "../../resources/images";

import hentPersonopplysninger from "./hentpersonopplysninger";
import Behandlingsmeny from "./behandlingsmeny";
import KopierbarTekst from "../kopierbarTekst";

import "./personlinje.css";
import * as StringUtils from "../../utils/streng";
import { KjoennType } from "../../graphql";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type PersonlinjeProps = PropsFromRedux & {
  behandlingID: number;
};

const Navn = ({ kjoenn, navn }: { kjoenn: KjoennType; navn: string }) => (
  <div className="personlinje__navn">
    <Ikon.Kjoenn kjoenn={kjoenn} className="ikon-kjoenn" />
    {navn}
  </div>
);

const Fnr = ({ fnr }: { fnr: string }) => <KopierbarTekst hovertekst="Kopier fødselsnummer">{fnr}</KopierbarTekst>;

const Doed = ({ erDoed }: { erDoed: boolean }) =>
  erDoed ? (
    <div className="personlinje_dod">
      <span>(Død)</span> <Ikon.Kors className="ikon-doed" />
    </div>
  ) : null;

const Statsborgerskap = ({ statsborgerskap }: { statsborgerskap: string[] }) => (
  <div className="personlinje__statsborgerskap">{StringUtils.separerListeMedBindestrek(statsborgerskap)}</div>
);

const Sivilstand = ({ sivilstand }: { sivilstand: string }) => (
  <div className="personlinje__sivilstand">{sivilstand}</div>
);

const Separator = () => <div className="personlinje__separator">/</div>;

const Personlinje = ({ behandlingID }: PersonlinjeProps) => {
  if (behandlingID < 0) return null;

  const personopplysninger = hentPersonopplysninger(behandlingID);

  return (
    <div className="personlinje">
      {personopplysninger ? (
        <div className="personlinje__personinfo">
          <Navn navn={personopplysninger.navn} kjoenn={personopplysninger.kjoenn} />
          <Doed erDoed={personopplysninger.erDoed} />
          <Separator />
          <Fnr fnr={personopplysninger.fnr} />
          <Separator />
          <Statsborgerskap statsborgerskap={personopplysninger.statsborgerskap} />
          <Separator />
          <Sivilstand sivilstand={personopplysninger.sivilstand} />
        </div>
      ) : (
        <div className="personlinje__personinfo">Klarte ikke hente personopplysninger</div>
      )}
      <Behandlingsmeny />
    </div>
  );
};

export default connector(Personlinje);
