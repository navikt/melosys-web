import React from "react";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { Person } from "../../../../services/modules/types";
import Fnr from "./fnr";

import Statsborgerskap from "./statsborgerskap";
import * as KV from "../../../../kodeverk";
import * as Ikon from "../../../../resources/images";

import "./personlinje.css";
import Behandlingsmeny from "./behandlingsmeny";

const mapStateToProps = (state: RootState) => ({
  // TODO: flere av personfeltene skal mappes fra PDL i api. Oppdater med de nye verdiene når det blir klart
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
  person: { sammensattNavn, kjoenn, personStatus, fnr, sivilstand },
  behandlingID,
}: PersonlinjeProps) => {
  if (behandlingID < 0) return null;

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
        {KV.Utils.erDoed(personStatus) && <Doed />}
        <Separator />
        <Fnr fnr={fnr} />
        <Separator />
        <Statsborgerskap behandlingID={behandlingID} />
        <Separator />
        <Sivilstand />
      </div>
      <Behandlingsmeny />
    </div>
  );
};

export default connector(Personlinje);
