import { useEffect } from "react";
import PT from "prop-types";
import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";

import { hentFaktaVerdi } from "../../../../domeneUtils";
import {
  konverterAvklartfaktaTilStegData,
  lagAvklartfakta,
  slettAvklartfakta,
} from "../../../../felleskomponenter/stegvelger";

function EnkeltAvklartfakta(props) {
  const {
    redigerbart,
    tittel,
    avklartefaktaTyper,
    avklartfakta,
    avklartfaktaKode,
    oppdaterData,
    onChange = null,
    slettData = null,
  } = props;

  const fakta = hentFaktaVerdi(avklartfakta);

  useEffect(() => {
    oppdaterData(konverterAvklartfaktaTilStegData(avklartfaktaKode, avklartfakta));
    const cleanup = () => {
      if (slettData) {
        slettData(slettAvklartfakta(avklartfaktaKode));
      }
    };
    return cleanup;
  }, []);

  const radioEndringHandler = (value) => {
    oppdaterData(lagAvklartfakta(avklartfaktaKode, null, value));

    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className="enkeltAvklartfakta__skjemafelt">
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.RadioGroup
            legend={tittel}
            onChange={radioEndringHandler}
            defaultValue={fakta}
            disabled={!redigerbart}
            name={avklartfaktaKode}
          >
            {avklartefaktaTyper.map((af) => {
              const id = Utils._uuid();
              return (
                <Nav.Radio key={id} id={id} value={af.type} disabled={af.disabled}>
                  {af.label}
                </Nav.Radio>
              );
            })}
          </Nav.RadioGroup>
        </Nav.Column>
      </Nav.Row>
    </div>
  );
}

EnkeltAvklartfakta.propTypes = {
  redigerbart: PT.bool.isRequired,
  avklartfakta: PT.object.isRequired,
  avklartfaktaKode: PT.string.isRequired,
  avklartefaktaTyper: PT.array.isRequired,
  tittel: PT.string.isRequired,
  oppdaterData: PT.func.isRequired,
  onChange: PT.func,
  slettData: PT.func,
};

export default EnkeltAvklartfakta;
