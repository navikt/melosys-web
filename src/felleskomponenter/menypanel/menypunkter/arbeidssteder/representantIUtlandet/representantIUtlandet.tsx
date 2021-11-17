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
import { behandlingsgrunnlagSelectors } from "../../../../../ducks/behandlingsgrunnlag";

const mapStateToProps = (state: RootState) => ({
  behandlingsgrunnlagFeilmeldinger: formSelectors.SoknadErrorsSelector(state),
  soknadsland: behandlingsgrunnlagSelectors.SoknadslandkoderSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => ({
  initializeRepresentantNavn: () => dispatch(change(KV.Form.SOKNAD, "representantIUtlandet.representantNavn", "")),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type InnerRepresentantIUtlandetProps = WrappedFieldProps & PropsFromRedux & { redigerbart: boolean };

const InnerRepresentantIUtlandet = (props: InnerRepresentantIUtlandetProps) => {
  const {
    redigerbart,
    soknadsland,
    behandlingsgrunnlagFeilmeldinger,
    initializeRepresentantNavn,
    input: { value, onChange },
  } = props;

  if (value === undefined) return null;

  const slettRepresentantIUtlandet = () => onChange(null);

  const handleApneRedigering = async (apneRedigering: () => void) => {
    await initializeRepresentantNavn();
    apneRedigering();
  };

  return (
    <EditerbartElement
      tittel={`${KV.Menypunkter.Arbeidssteder.undertitler.representantIUtlandet}${
        value.representantNavn ? `: ${value.representantNavn}` : ""
      }`}
      tittelUnderstrek
      redigerbart={redigerbart}
      onBinClick={slettRepresentantIUtlandet}
      onLagreClick={() => Utils._isEmpty(behandlingsgrunnlagFeilmeldinger)}
      harData={value.representantNavn || value.representantNavn === ""}
      redigererRender={() => <Redigerer redigerbart={redigerbart} />}
      redigeringUtfortRender={() => <RedigeringUtfort adresselinjer={value.adresselinjer} soknadsland={soknadsland} />}
      ingenDataRender={(apneRedigering) => (
        <IngenDataRender
          redigerbart={redigerbart}
          onClick={() => handleApneRedigering(apneRedigering)}
          lenketekst="Legg til representant i utlandet"
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
