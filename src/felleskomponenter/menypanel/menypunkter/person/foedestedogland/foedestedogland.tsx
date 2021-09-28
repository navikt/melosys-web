import React from "react";
import { Field, WrappedFieldProps } from "redux-form";

import * as Mui from "../../../../ui";
import * as KV from "../../../../../kodeverk";
import * as Ikoner from "../../../../../resources/images";

import EditerbartElement from "../../editerbartElement";
import EnkeltFoedestedSkjema from "./enkeltfoedestoglandedskjema";
import Utfyltfoedestedogland from "./utfyltfoedestedogland";

type InnerFoedestedProps = WrappedFieldProps & { redigerbart: boolean };

const InnerFoedestedComponent = (props: InnerFoedestedProps) => {
  const {
    redigerbart,
    input: { value, onChange },
  } = props;

  if (value === undefined) return null;

  const slettFoedestedOgLand = () => onChange(null);

  return (
    <EditerbartElement
      tittel={KV.Menypunkter.Person.undertitler.foedestedOgLand}
      redigerbart={redigerbart}
      onBinClick={slettFoedestedOgLand}
      harData={value.foedested && value.foedeland}
      redigererRender={() => <EnkeltFoedestedSkjema redigerbart={redigerbart} />}
      redigeringUtfortRender={() => <Utfyltfoedestedogland foedestedOgLand={value} />}
      ingenDataRender={(apneRedigering) => (
        <>
          {redigerbart && (
            <Mui.Knappelenke
              onClick={() => {
                apneRedigering();
              }}
              ikon={Ikoner.Add}
            >
              Legg til fødested og -land
            </Mui.Knappelenke>
          )}
        </>
      )}
    />
  );
};

interface FoedestedWrapperProps {
  redigerbart: boolean;
}

const FoedestedWrapper = ({ ...rest }: FoedestedWrapperProps) => (
  <Field name="foedestedOgLand" component={InnerFoedestedComponent} props={rest} />
);

export default FoedestedWrapper;
