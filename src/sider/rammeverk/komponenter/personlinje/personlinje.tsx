import React from "react";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { KTObject } from "@navikt/melosys-kodeverk";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { Person } from "../../../../services/modules/types";

import * as KV from "../../../../kodeverk";
import * as Ikon from "../../../../resources/images";

import Statsborgerskap from "./statsborgerskap";
import Behandlingsmeny from "../behandlingsmeny/behandlingsmeny";
import KopierbarTekst from "../../../../felleskomponenter/kopierbarTekst";

import "./personlinje.css";

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

const Navn = ({ kjoenn, navn }: { kjoenn: KTObject; navn: string }) => (
  <div className="personlinje__navn">
    <Ikon.Kjoenn kjoennKode={KV.objektTilKode(kjoenn)} className="ikon-kjoenn" />
    {navn}
  </div>
);

const Fnr = ({ fnr }: { fnr: string }) => <KopierbarTekst hovertekst="Kopier fødselsnummer">{fnr}</KopierbarTekst>;

const Doed = () => (
  <div className="personlinje_dod">
    <span>(Død)</span> <Ikon.Kors className="ikon-doed" />
  </div>
);

const Sivilstand = ({ sivilstand }: { sivilstand: KTObject }) => (
  <div className="personlinje__sivilstand">{KV.objektTilTerm(sivilstand)}</div>
);

const Separator = () => <div className="personlinje__separator">/</div>;

const Personlinje = ({
  person: { sammensattNavn, kjoenn, personStatus, fnr, sivilstand },
  behandlingID,
}: PersonlinjeProps) => {
  if (behandlingID < 0) return null;

  const erDoed = KV.Utils.erDoed(KV.objektTilKode(personStatus));

  return (
    <div className="personlinje">
      <div className="personlinje__personinfo">
        <Navn navn={sammensattNavn} kjoenn={kjoenn} />
        {erDoed && <Doed />}
        <Separator />
        <Fnr fnr={fnr} />
        <Separator />
        <Statsborgerskap behandlingID={behandlingID} />
        <Separator />
        <Sivilstand sivilstand={sivilstand} />
      </div>
      <Behandlingsmeny />
    </div>
  );
};

export default connector(Personlinje);
