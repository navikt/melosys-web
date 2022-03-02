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
import { useFeatureToggle } from "../../../../../featuretoggle";

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

  const fjernAnnenAdresseToggle = useFeatureToggle("melosys.web.fjern_annen_adresse");
  const redigerbartOgToggleDisabled = redigerbart && fjernAnnenAdresseToggle !== "enabled";

  if (Object.values(oppgittAdresse).every((value) => value === undefined)) return null;
  return (fjernAnnenAdresseToggle === "enabled" && oppgittAdresseHarVerdier) ||
    fjernAnnenAdresseToggle !== "enabled" ? (
    <div className={cls}>
      <EditerbartElement
        redigerbart={redigerbartOgToggleDisabled}
        harData={oppgittAdresseHarVerdier}
        tittel={KV.Menypunkter.Person.undertitler.annenAdresse}
        onBinClick={resetOppgittAdresse}
        symbolsynlighet={ikkeVisBinIngenDataSymbolsynlighet}
        redigererRender={() => <Felter redigerbart={redigerbartOgToggleDisabled} />}
        redigeringUtfortRender={() => <UtfyltAdresse adresse={oppgittAdresse} />}
        ingenDataRender={(apneRedigering) =>
          redigerbartOgToggleDisabled && (
            <>
              <Nav.Typo.Normaltekst style={{ marginBottom: "1em" }}>
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
  ) : (
    <></>
  );
};

export default connector(AnnenAdresse);
