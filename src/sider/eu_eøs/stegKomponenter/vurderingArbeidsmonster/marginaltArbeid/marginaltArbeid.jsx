import { useDispatch, useSelector } from "react-redux";
import PT from "prop-types";
import { formValueSelector, reset } from "redux-form";

import * as KV from "../../../../../kodeverk";
import LandLinje from "../landlinje/landlinje";
import CheckableLandLinje from "../checkableLandLinje/checkableLandLinje";
import * as Nav from "../../../../../navFrontend";
import * as MPT from "../../../../../proptypes";
import { BOOLSK_STRING } from "../../../../../constants";
import { lagAvklartfakta } from "../../../../../felleskomponenter/stegvelger";
import MKV from "../../../../../melosyskodeverk";
import checkableLandLinjeNy from "../checkableLandLinje/checkableLandLinjeNy";
import CheckableLandLinjeNy from "../checkableLandLinje/checkableLandLinjeNy";

const MarginaltArbeid = ({ arbeidsland, redigerbart, marginaltArbeid, oppdaterData }) => {
  const { flereLandUkjentHvilke } = useSelector((state) => formValueSelector(KV.Form.SOKNAD)(state, "soknadsland"));

  const landliste = flereLandUkjentHvilke ? (<div><b>Flere land. Ikke kjent hvilke</b></div>) :
    (<div>
      <Nav.CheckboxGroup legend="Kryss av for land hvor det utføres marginalt arbeid (> 5%)"
                         disabled={!redigerbart}>
        {
          arbeidsland.map(({ land }) => {
            const avklartMarginaltArbeidILand = marginaltArbeid.find(
              (enkeltAvklaring) => enkeltAvklaring.subjektID === land.kode
            );
            const key = `marginaltArbeidslandListe${land.kode}`;
            return (
              <CheckableLandLinjeNy
                key={key}
                land={land}
                avklartMarginaltArbeidILand={avklartMarginaltArbeidILand}
                oppdaterData={oppdaterData}
                redigerbart={true} />
            );
          })
        }
      </Nav.CheckboxGroup>
    </div>);

  return (
    <Nav.Fieldset legend="Er det marginalt arbeid i noen av landene?">
      <div className="marginaltArbeid">
        <div className="landliste_innhold">
          {landliste}
        </div>
      </div>
    </Nav.Fieldset>
  );
};

MarginaltArbeid.propTypes = {
  arbeidsland: PT.arrayOf(MPT.ArbeidslandMedYrkesaktivitet),
  marginaltArbeid: PT.array,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired
};

MarginaltArbeid.defaultProps = {
  arbeidsland: [],
  marginaltArbeid: []
};

export default MarginaltArbeid;
