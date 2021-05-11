import React from "react";

import { FieldArray, WrappedFieldArrayProps } from "redux-form";

import * as Nav from "../../../../../utils/navFrontend";
import * as Mui from "../../../../ui";
import * as KV from "../../../../../kodeverk";
import * as Ikoner from "../../../../../resources/images";

import EditerbartElement from "../../editerbartElement";
import UtfyltUtenlandskIdent from "./utfyltutenlandskident";
import EnkeltUtenlandskIdentSkjema from "./enkeltutenlandskidentskjema";

import { UtenlandskIdent } from "./types";

type InnerUtenlandskIdComponentProps = WrappedFieldArrayProps<UtenlandskIdent> & {
  redigerbart: boolean;
};

const InnerUtenlandskIdComponent = (props: InnerUtenlandskIdComponentProps) => {
  const { redigerbart, fields } = props;
  const { push, remove } = fields;
  const felter = props.fields.getAll();
  const leggTilTomtFelt = () => push({ ident: "", landkode: "" });

  if (felter === undefined) return null;

  return (
    <EditerbartElement
      redigerbart={redigerbart}
      tittel={KV.Menypunkter.Person.undertitler.utenlandskID}
      onBinClick={() => fields.removeAll()}
      harData={felter.length !== 0}
      redigererRender={() => (
        <div>
          {felter.map((felt, indeks) => (
            <EnkeltUtenlandskIdentSkjema
              /* eslint-disable react/no-array-index-key */
              key={indeks}
              redigerbart={redigerbart}
              slett={() => remove(indeks)}
              overordnetFeltNavn={`utenlandskIdent[${indeks}]`}
            />
          ))}
          {redigerbart && (
            <Nav.Row>
              <Nav.Column xs="12">
                <Mui.Knappelenke onClick={leggTilTomtFelt} ikon={Ikoner.Add}>
                  Legg til ny rad
                </Mui.Knappelenke>
              </Nav.Column>
            </Nav.Row>
          )}
        </div>
      )}
      redigeringUtfortRender={() => <UtfyltUtenlandskIdent utenlandskeIdenter={felter} />}
      ingenDataRender={(apneRedigering) => (
        <>
          {redigerbart && (
            <Mui.Knappelenke
              onClick={() => {
                apneRedigering();
                leggTilTomtFelt();
              }}
              ikon={Ikoner.Add}
            >
              Legg til ID-nummer
            </Mui.Knappelenke>
          )}
        </>
      )}
    />
  );
};

interface UtenlandskIdWrapperProps {
  redigerbart: boolean;
}

const UtenlandskIdWrapper = ({ ...rest }: UtenlandskIdWrapperProps) => (
  <FieldArray name="utenlandskIdent" component={InnerUtenlandskIdComponent} props={rest} rerenderOnEveryChange />
);

export default UtenlandskIdWrapper;
