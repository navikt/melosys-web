import { FieldArray, WrappedFieldArrayProps } from "redux-form";

import * as Skjema from "../../../../../skjema";
import * as Nav from "../../../../../../navFrontend";
import * as Ikoner from "../../../../../../resources/images";
import * as Mui from "../../../../../ui";
import * as Symboler from "../../../symboler";

import bem from "../../../../../../bemUtils";
import "./adresselinjer.css";

const adresselinjerCls = bem("adresselinjer");

type InnerAdresselinjerProps = WrappedFieldArrayProps<string> & {
  redigerbart: boolean;
};

function InnerAdresselinjer(props: InnerAdresselinjerProps) {
  const { redigerbart, fields } = props;
  const { push, remove, getAll } = fields;
  const felter = getAll();
  const leggTilTomtFelt = () => push("");

  return (
    <div className={adresselinjerCls.block}>
      <Nav.BodyLong size="small">Fullstendig adresse</Nav.BodyLong>
      {felter &&
        felter.map((felt, index) => (
          <Nav.Row key={index} className={adresselinjerCls.element("adresselinje")}>
            <Nav.Column xs="9">
              <Skjema.Input
                label=""
                feltNavn={`representantIUtlandet.adresselinjer[${index}]`}
                disabled={!redigerbart}
                placeholder={`Adresselinje ${index + 1}`}
              />
            </Nav.Column>
            <Symboler.Slett onClick={() => remove(index)} className={adresselinjerCls.element("slett_symbol")} />
          </Nav.Row>
        ))}
      {redigerbart && felter && felter.length < 4 && (
        <Nav.Row>
          <Nav.Column xs="9" className={adresselinjerCls.element("leggTil_symbol")}>
            <Mui.Lenkeknapp onClick={leggTilTomtFelt} ikon={Ikoner.Add}>
              Legg til adresselinje
            </Mui.Lenkeknapp>
          </Nav.Column>
        </Nav.Row>
      )}
    </div>
  );
}

interface AdresselinjerProps {
  redigerbart: boolean;
}

function Adresselinjer({ ...rest }: AdresselinjerProps) {
  return <FieldArray name="representantIUtlandet.adresselinjer" component={InnerAdresselinjer} props={rest} />;
}

export default Adresselinjer;
