import { FieldArray, WrappedFieldArrayProps } from "redux-form";

import * as Nav from "../../../../../navFrontend";
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

function InnerUtenlandskIdComponent(props: InnerUtenlandskIdComponentProps) {
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
                <Mui.Lenkeknapp onClick={leggTilTomtFelt} ikon={Ikoner.Add}>
                  Legg til ny rad
                </Mui.Lenkeknapp>
              </Nav.Column>
            </Nav.Row>
          )}
        </div>
      )}
      redigeringUtfortRender={() => <UtfyltUtenlandskIdent utenlandskeIdenter={felter} />}
      ingenDataRender={(apneRedigering) =>
        redigerbart ? (
          <Mui.Lenkeknapp
            onClick={() => {
              apneRedigering();
              leggTilTomtFelt();
            }}
            ikon={Ikoner.Add}
          >
            Legg til ID-nummer
          </Mui.Lenkeknapp>
        ) : null
      }
    />
  );
}

interface UtenlandskIdWrapperProps {
  redigerbart: boolean;
}

function UtenlandskIdWrapper({ ...rest }: UtenlandskIdWrapperProps) {
  return (
    <FieldArray name="utenlandskIdent" component={InnerUtenlandskIdComponent} props={rest} rerenderOnEveryChange />
  );
}

export default UtenlandskIdWrapper;
