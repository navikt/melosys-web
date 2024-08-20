import { useSelector } from "react-redux";
import PT from "prop-types";
import { formValueSelector } from "redux-form";

import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";
import * as MPT from "../../../../../proptypes";
import CheckableLandLinje from "../checkableLandLinje/checkableLandLinje";

const MarginaltArbeid = ({ arbeidsland, redigerbart, marginaltArbeid, oppdaterData }) => {
  const { flereLandUkjentHvilke } = useSelector((state) => formValueSelector(KV.Form.SOKNAD)(state, "soknadsland"));

  return (
    <Nav.Fieldset legend="">
      <div className="marginaltArbeid">
        <div className="landliste_innhold">
          {flereLandUkjentHvilke ? (
            <div>
              <b>Flere land. Ikke kjent hvilke</b>
            </div>
          ) : (
            <div>
              <Nav.CheckboxGroup
                size="small"
                legend="Kryss av for land hvor det utføres marginalt arbeid (> 5%)"
                readOnly={!redigerbart}
              >
                {arbeidsland.map(({ land }) => {
                  const avklartMarginaltArbeidILand = marginaltArbeid.find(
                    (enkeltAvklaring) => enkeltAvklaring.subjektID === land.kode
                  );
                  const key = `marginaltArbeidslandListe${land.kode}`;
                  return (
                    <CheckableLandLinje
                      key={key}
                      arbeidsland={land}
                      avklartMarginaltArbeidILand={avklartMarginaltArbeidILand}
                      oppdaterData={oppdaterData}
                    />
                  );
                })}
              </Nav.CheckboxGroup>
            </div>
          )}
        </div>
      </div>
    </Nav.Fieldset>
  );
};

MarginaltArbeid.propTypes = {
  arbeidsland: PT.arrayOf(MPT.ArbeidslandMedYrkesaktivitet),
  marginaltArbeid: PT.array,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
};

MarginaltArbeid.defaultProps = {
  arbeidsland: [],
  marginaltArbeid: [],
};

export default MarginaltArbeid;
