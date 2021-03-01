import React from "react";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import classNames from "classnames";

import * as Utils from "../../../../../utils";
import * as Nav from "../../../../../utils/navFrontend";
import * as KV from "../../../../../kodeverk";

import MKV from "../../../../../melosyskodeverk";

import { behandlingsgrunnlagSelectors } from "../../../../../ducks/behandlingsgrunnlag";

import "./redigeringUtfort.css";

const mapStateToProps = (state: RootState) => ({
  soknadsland: behandlingsgrunnlagSelectors.SoknadslandSelector(state),
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type RedigeringUtfortProps = PropsFromRedux & {
  className?: string;
};

const RedigeringUtfort = ({ soknadsland, className }: RedigeringUtfortProps) => {
  const cls = classNames(className, "soknadslandvelger-redigering-utfort");

  return (
    <div className={cls}>
      <Nav.typo.EtikettLiten className="etikett-liten">Land</Nav.typo.EtikettLiten>
      <Nav.typo.Element>
        {Utils.streng.arrayTilKonjunksjon(
          soknadsland.map((land: string) => KV.kodeTilTerm(land, MKV.KTObjects.landkoder))
        ) || "Ingen land valgt"}
      </Nav.typo.Element>
    </div>
  );
};

export default connector(RedigeringUtfort);
