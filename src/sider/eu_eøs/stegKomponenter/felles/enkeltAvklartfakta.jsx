import { useEffect } from "react";
import PT from "prop-types";
import * as Nav from "../../../../navFrontend";
import * as MPT from "../../../../proptypes";
import * as Utils from "../../../../utils";
import * as Mui from "../../../../felleskomponenter/ui";

import { hentFaktaVerdi } from "../../../../domeneUtils";
import {
  konverterAvklartfaktaTilStegData,
  lagAvklartfakta,
  slettAvklartfakta,
  lagAvklartefaktaBegrunnelse,
} from "../../../../felleskomponenter/stegvelger";

const EnkeltAvklartfakta = (props) => {
  const {
    redigerbart,
    begrunnelser,
    tittel,
    avklartefaktaTyper,
    avklartfakta,
    avklartfaktaKode,
    oppdaterData,
    onChange,
  } = props;

  const fakta = hentFaktaVerdi(avklartfakta);

  useEffect(() => {
    oppdaterData(konverterAvklartfaktaTilStegData(avklartfaktaKode, avklartfakta));
    const cleanup = () => {
      if (props.slettData) {
        props.slettData(slettAvklartfakta(avklartfaktaKode));
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

  const listevalgEndringHandler = (event) => {
    oppdaterData(lagAvklartefaktaBegrunnelse(avklartfaktaKode, null, [event.value]));
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
            size="small"
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
      {begrunnelser.length > 0 && (
        <Nav.Row>
          <Nav.Column xs="12" md="10" lg="8">
            <Nav.Fieldset legend="Begrunnelse:">
              <Mui.ListevelgerFlervalg
                muligeValg={begrunnelser}
                label="Legg til begrunnelse:"
                tillatFritekst={false}
                onChange={listevalgEndringHandler}
                defaultElementer={avklartfakta.begrunnelseKoder}
                disabled={!redigerbart}
              />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>
      )}
    </div>
  );
};

EnkeltAvklartfakta.propTypes = {
  redigerbart: PT.bool.isRequired,
  avklartfakta: PT.object.isRequired,
  avklartfaktaKode: PT.string.isRequired,
  avklartefaktaTyper: PT.array.isRequired,
  tittel: PT.string.isRequired,
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
  oppdaterData: PT.func.isRequired,
  onChange: PT.func,
  slettData: PT.func,
};

EnkeltAvklartfakta.defaultProps = {
  begrunnelser: [],
  onChange: null,
  slettData: null,
};

export default EnkeltAvklartfakta;
