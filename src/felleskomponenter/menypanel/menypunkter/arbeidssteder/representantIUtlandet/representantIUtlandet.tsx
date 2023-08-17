import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { change, Field, WrappedFieldProps } from "redux-form";
import { connect, ConnectedProps } from "react-redux";

import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";

import { formSelectors } from "../../../../../ducks/form";
import EditerbartElement, { Status } from "../../editerbartElement";
import RedigeringUtfort from "./redigeringUtfort";
import Redigerer from "./redigerer";
import IngenDataRender from "./ingenDataRender";
import { mottatteOpplysningerSelectors } from "../../../../../ducks/mottatteOpplysninger";

const mapStateToProps = (state: RootState) => ({
  mottatteOpplysningerFeilmeldinger: formSelectors.SoknadErrorsSelector(state),
  soknadsland: mottatteOpplysningerSelectors.SoknadslandkoderSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => ({
  initializeRepresentantIUtlandet: (value: KV.Form.RepresentantIUtlandet) =>
    dispatch(change(KV.Form.SOKNAD, "representantIUtlandet", value)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type InnerRepresentantIUtlandetProps = WrappedFieldProps & PropsFromRedux & { redigerbart: boolean };

const InnerRepresentantIUtlandet = (props: InnerRepresentantIUtlandetProps) => {
  const {
    redigerbart,
    soknadsland,
    mottatteOpplysningerFeilmeldinger,
    initializeRepresentantIUtlandet,
    input: { value, onChange },
  } = props;

  if (value === undefined) return null;

  const slettRepresentantIUtlandet = () => onChange(null);

  const handleApneRedigering = async (apneRedigering: () => void) => {
    await initializeRepresentantIUtlandet({ representantNavn: "", adresselinjer: ["", "", ""] });
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
      onLagreClick={() => Utils._isEmpty(mottatteOpplysningerFeilmeldinger)}
      harData={value.representantNavn || value.representantNavn === ""}
      redigererRender={() => <Redigerer redigerbart={redigerbart} />}
      redigeringUtfortRender={() => <RedigeringUtfort adresselinjer={value.adresselinjer} soknadsland={soknadsland} />}
      ingenDataRender={(apneRedigering) => (
        <IngenDataRender
          redigerbart={redigerbart}
          onClick={() => handleApneRedigering(apneRedigering)}
          lenketekst="Legg til arbeidssted/representant"
        />
      )}
      symbolsynlighet={{ [Status.Redigerer]: { pencil: false, bin: true } }}
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
