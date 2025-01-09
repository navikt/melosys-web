import classNames from "classnames";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import * as KV from "../../../../../kodeverk";

import EditerbartElement from "../../editerbartElement";
import UtfyltAdresse from "./utfyltadresse";

import { formSelectors } from "../../../../../ducks/form";

import "./annenadresse.css";

const mapStateToProps = (state: RootState) => ({
  oppgittAdresse: formSelectors.SoknadOppgittAdresseSelector(state),
  oppgittAdresseHarVerdier: formSelectors.SoknadOppgittAdresseHarVerdierSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type AnnenAdresseProps = PropsFromRedux & {
  className?: string;
};

function AnnenAdresse({ className, oppgittAdresse, oppgittAdresseHarVerdier }: AnnenAdresseProps) {
  const cls = classNames(className);

  if (Object.values(oppgittAdresse).every((value) => value === undefined)) return null;
  return oppgittAdresseHarVerdier ? (
    <div className={cls}>
      <EditerbartElement
        harData
        redigerbart={false}
        tittel={KV.Menypunkter.Person.undertitler.annenAdresse}
        redigererRender={() => null}
        redigeringUtfortRender={() => <UtfyltAdresse adresse={oppgittAdresse} />}
      />
    </div>
  ) : null;
}

export default connector(AnnenAdresse);
