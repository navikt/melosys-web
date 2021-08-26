import React from "react";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";

import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { Person } from "../../../services/modules/types";
import Fnr from "./fnr";

import Statsborgerskap from "./statsborgerskap";
import * as KV from "../../../kodeverk";
import * as Ikon from "../../../resources/images";

import "./personlinje.css";

const mapStateToProps = (state: RootState) => ({
  person: behandlingerSelectors.PersonSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type PersonlinjeProps = PropsFromRedux & {
  person: Person;
  behandlingID: number;
};

const Personlinje = ({
  person: { sammensattNavn, kjoenn, doedsdato, fnr, sivilstand },
  behandlingID,
}: PersonlinjeProps) => {
  const Navn = () => (
    <div className="personlinje__navn">
      <Ikon.Kjoenn kjoenn={kjoenn} className="ikon-kjoenn" />
      {sammensattNavn}
    </div>
  );

  const Doed = () => (
    <div className="personlinje_dod">
      <span>(Død)</span> <Ikon.Kors className="ikon-doed" />
    </div>
  );

  const Sivilstand = () => <div className="personlinje__sivilstand">{KV.objektTilTerm(sivilstand)}</div>;

  const Separator = () => <div className="personlinje__separator">/</div>;

  return (
    <div className="personlinje">
      <div className="personlinje__personinfo">
        <Navn />
        {doedsdato && <Doed />}
        <Separator />
        <Fnr fnr={fnr} />
        <Separator />
        <Statsborgerskap behandlingID={behandlingID} />
        <Separator />
        <Sivilstand />
      </div>
      <div className="personlinje__behandlingsmeny">
        <Ikon.Hamburger className="hamburger" />
      </div>
    </div>
  );
};

export default connector(Personlinje);
