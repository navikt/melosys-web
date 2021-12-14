import React from "react";
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

const mapStateToProps = (state: RootState) => ({
  behandlingsgrunnlagFeilmeldinger: formSelectors.SoknadErrorsSelector(state),
});

const connector = connect(mapStateToProps);

type InnerFoedestedProps = WrappedFieldProps & { redigerbart: boolean } & ConnectedProps<typeof connector>;

const InnerFoedestedComponent = (props: InnerFoedestedProps) => {
  const {
    redigerbart,
    behandlingsgrunnlagFeilmeldinger,
    input: { value, onChange },
  } = props;

  if (value === undefined) return null;

  const slettFoedestedOgLand = () => onChange(null);

  return (
    <EditerbartElement
      tittel={KV.Menypunkter.Person.undertitler.foedestedOgLand}
      redigerbart={redigerbart}
      onBinClick={slettFoedestedOgLand}
      onLagreClick={() => Utils._isEmpty(behandlingsgrunnlagFeilmeldinger)}
      harData={value.foedested && value.foedeland}
      redigererRender={() => <Enkeltfoedestedoglandskjema redigerbart={redigerbart} />}
      redigeringUtfortRender={() => <Utfyltfoedestedogland foedestedOgLand={value} />}
      ingenDataRender={(apneRedigering) =>
        redigerbart ? (
          <Mui.Knappelenke
            onClick={() => {
              apneRedigering();
            }}
            ikon={Ikoner.Add}
          >
            Legg til fødested og -land
          </Mui.Knappelenke>
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
