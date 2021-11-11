import React from "react";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { change, Field, WrappedFieldProps } from "redux-form";
import { connect, ConnectedProps } from "react-redux";

import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";

import { formSelectors } from "../../../../../ducks/form";
import EditerbartElement from "../../editerbartElement";
import RedigeringUtfort from "./redigeringUtfort";
import Redigerer from "./redigerer";
import IngenDataRender from "./ingenDataRender";

const mapStateToProps = (state: RootState) => ({
  behandlingsgrunnlagFeilmeldinger: formSelectors.SoknadErrorsSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => ({
  initializeRepresentantNavn: () => dispatch(change(KV.Form.SOKNAD, "representantIUtlandet.representantNavn", "")),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type InnerRepresentantIUtlandetPRops = WrappedFieldProps & { redigerbart: boolean } & ConnectedProps<typeof connector>;

const InnerRepresentantIUtlandet = (props: InnerRepresentantIUtlandetPRops) => {
  const {
    redigerbart,
    behandlingsgrunnlagFeilmeldinger,
    initializeRepresentantNavn,
    input: { value, onChange },
  } = props;

  if (value === undefined) return null;

  const slettRepresentantIUtlandet = () => onChange(null);

  return (
    <EditerbartElement
      tittel={`${KV.Menypunkter.Arbeidssteder.undertitler.representantIUtlandet}${
        value.representantNavn ? `: ${value.representantNavn}` : ""
      }`}
      tittelUnderstrek
      redigerbart={redigerbart}
      onBinClick={slettRepresentantIUtlandet}
      onLagreClick={() => Utils._isEmpty(behandlingsgrunnlagFeilmeldinger)}
      harData={value.representantNavn}
      redigererRender={() => <Redigerer redigerbart={redigerbart} />}
      redigeringUtfortRender={() => <RedigeringUtfort representantIUtlandet={value} />}
      ingenDataRender={(apneRedigering) => (
        <IngenDataRender
          redigerbart={redigerbart}
          apneRedigering={apneRedigering}
          initialize={initializeRepresentantNavn}
        />
      )}
    />
  );
};

interface RepresentantIUtlandetWrapperProps {
  redigerbart: boolean;
}

const RepresentantIUtlandetWrapper = ({ ...rest }: RepresentantIUtlandetWrapperProps) => (
  <Field name="representantIUtlandet" component={InnerRepresentantIUtlandet} props={rest} />
);

export default connector(RepresentantIUtlandetWrapper);
