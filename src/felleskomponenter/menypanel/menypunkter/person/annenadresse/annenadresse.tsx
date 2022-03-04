import React from "react";
import classNames from "classnames";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import * as KV from "../../../../../kodeverk";

import EditerbartElement, { ikkeVisBinIngenDataSymbolsynlighet } from "../../editerbartElement";
import UtfyltAdresse from "./utfyltadresse";
import Felter from "./felter";

import { formOperations, formSelectors } from "../../../../../ducks/form";

import "./annenadresse.css";

const mapStateToProps = (state: RootState) => ({
  oppgittAdresse: formSelectors.SoknadOppgittAdresseSelector(state),
  oppgittAdresseHarVerdier: formSelectors.SoknadOppgittAdresseHarVerdierSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => ({
  resetOppgittAdresse: () =>
    dispatch(
      formOperations.reset(KV.Form.SOKNAD, [
        "oppgittAdresseTilleggsnavn",
        "oppgittAdresseGatenavn",
        "oppgittAdresseHusnummerEtasjeLeilighet",
        "oppgittAdressePostboks",
        "oppgittAdressePostnummer",
        "oppgittAdressePoststed",
        "oppgittAdresseRegion",
        "oppgittAdresseLand",
      ])
    ),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type AnnenAdresseProps = PropsFromRedux & {
  className?: string;
};

const AnnenAdresse = ({
  className,
  oppgittAdresse,
  oppgittAdresseHarVerdier,
  resetOppgittAdresse,
}: AnnenAdresseProps) => {
  const cls = classNames(className);

  if (Object.values(oppgittAdresse).every((value) => value === undefined)) return null;
  return oppgittAdresseHarVerdier ? (
    <div className={cls}>
      <EditerbartElement
        redigerbart={false}
        harData={oppgittAdresseHarVerdier}
        tittel={KV.Menypunkter.Person.undertitler.annenAdresse}
        onBinClick={resetOppgittAdresse}
        symbolsynlighet={ikkeVisBinIngenDataSymbolsynlighet}
        redigererRender={() => <Felter redigerbart={false} />}
        redigeringUtfortRender={() => <UtfyltAdresse adresse={oppgittAdresse} />}
      />
    </div>
  ) : null;
};

export default connector(AnnenAdresse);
