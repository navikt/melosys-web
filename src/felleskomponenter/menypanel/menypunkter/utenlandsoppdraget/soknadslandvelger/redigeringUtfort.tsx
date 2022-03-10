import React from "react";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import classNames from "classnames";

import * as Utils from "../../../../../utils";
import * as Nav from "../../../../../navFrontend";
import * as KV from "../../../../../kodeverk";

import MKV from "../../../../../melosyskodeverk";

import { behandlingsgrunnlagSelectors } from "../../../../../ducks/behandlingsgrunnlag";

import "./redigeringUtfort.css";

const mapStateToProps = (state: RootState) => ({
  soknadsland: behandlingsgrunnlagSelectors.SoknadslandkoderSelector(state),
  soknadslandErUkjenteEllerAlleEosLand:
    behandlingsgrunnlagSelectors.SoknadslandErUkjenteEllerAlleEosLandSelector(state),
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type RedigeringUtfortProps = PropsFromRedux & {
  className?: string;
};

const RedigeringUtfort = ({ soknadsland, soknadslandErUkjenteEllerAlleEosLand, className }: RedigeringUtfortProps) => {
  const cls = classNames(className, "soknadslandvelger-redigering-utfort");

  const soknadslandTekst = soknadslandErUkjenteEllerAlleEosLand ? (
    "Flere EØS-land/Sveits. Ikke kjent hvilke."
  ) : (
    <Nav.Typo.Element className="element">
      {Utils.streng.arrayTilKonjunksjon(
        soknadsland.map((land: string) => KV.kodeTilTerm(land, MKV.KTObjects.landkoder))
      ) || "Ingen land valgt"}
    </Nav.Typo.Element>
  );

  return (
    <div className={cls}>
      <Nav.Typo.Normaltekst className="etikett-liten">Land</Nav.Typo.Normaltekst>
      {soknadslandTekst}
    </div>
  );
};

export default connector(RedigeringUtfort);
