import React from "react";
import classNames from "classnames";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import * as KV from "../../../../../kodeverk";
import * as Mui from "../../../../ui";
import * as Nav from "../../../../../navFrontend";
import * as Ikoner from "../../../../../resources/images";

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
  redigerbart: boolean;
  className?: string;
};

const AnnenAdresse = ({
  redigerbart,
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
        redigerbart={redigerbart}
        harData={oppgittAdresseHarVerdier}
        tittel={KV.Menypunkter.Person.undertitler.annenAdresse}
        onBinClick={resetOppgittAdresse}
        symbolsynlighet={ikkeVisBinIngenDataSymbolsynlighet}
        redigererRender={() => <Felter redigerbart={redigerbart} />}
        redigeringUtfortRender={() => <UtfyltAdresse adresse={oppgittAdresse} />}
        ingenDataRender={(apneRedigering) =>
          redigerbart && (
            <>
              <Nav.Typo.Normaltekst className="annenadresse__infotekst">
                Her kan du legge til en adresse som vil bli brukt som bostedsadresse i A1 og SED. I brev benyttes
                adresse fra register.
              </Nav.Typo.Normaltekst>

              <Mui.Knappelenke onClick={apneRedigering} ikon={Ikoner.Add}>
                Legg til adresse
              </Mui.Knappelenke>
            </>
          )
        }
      />
    </div>
  ) : null;
};

export default connector(AnnenAdresse);
