import { Field, WrappedFieldProps } from "redux-form";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import * as Mui from "../../../../ui";
import * as KV from "../../../../../kodeverk";
import * as Ikoner from "../../../../../resources/images";
import * as Utils from "../../../../../utils";

import { formSelectors } from "../../../../../ducks/form";

import EditerbartElement from "../../editerbartElement";
import Enkeltfoedestedoglandskjema from "./enkeltfoedestedoglandskjema";
import Utfyltfoedestedogland from "./utfyltfoedestedogland";
import { visAldriBinSymbolsynlighet } from "../../editerbartElement/editerbartElement";

const mapStateToProps = (state: RootState) => ({
  mottatteOpplysningerFeilmeldinger: formSelectors.SoknadErrorsSelector(state),
});

const connector = connect(mapStateToProps);

type InnerFoedestedProps = WrappedFieldProps & { redigerbart: boolean } & ConnectedProps<typeof connector>;

const InnerFoedestedComponent = (props: InnerFoedestedProps) => {
  const {
    redigerbart,
    mottatteOpplysningerFeilmeldinger,
    input: { value, onChange },
  } = props;

  if (value === undefined) return null;

  const slettFoedestedOgLand = () => onChange(null);

  return (
    <EditerbartElement
      tittel={KV.Menypunkter.Person.undertitler.foedestedOgLand}
      redigerbart={redigerbart}
      symbolsynlighet={visAldriBinSymbolsynlighet}
      onLagreClick={() => Utils._isEmpty(mottatteOpplysningerFeilmeldinger?.foedestedOgLand)}
      harData={value.foedested && value.foedeland}
      redigererRender={(lukkRedigering) => (
        <Enkeltfoedestedoglandskjema
          redigerbart={redigerbart}
          onBinClick={() => {
            slettFoedestedOgLand();
            lukkRedigering();
          }}
        />
      )}
      redigeringUtfortRender={() => <Utfyltfoedestedogland foedestedOgLand={value} />}
      ingenDataRender={(apneRedigering) =>
        redigerbart ? (
          <Mui.Lenkeknapp onClick={apneRedigering} ikon={Ikoner.Add}>
            Legg til fødested og -land
          </Mui.Lenkeknapp>
        ) : null
      }
    />
  );
};

interface FoedestedWrapperProps {
  redigerbart: boolean;
}

const FoedestedWrapper = ({ ...rest }: FoedestedWrapperProps) => (
  <Field name="foedestedOgLand" component={InnerFoedestedComponent} props={rest} />
);

export default connector(FoedestedWrapper);
