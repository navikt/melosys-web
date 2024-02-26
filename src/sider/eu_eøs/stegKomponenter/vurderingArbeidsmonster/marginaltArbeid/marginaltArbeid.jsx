import { useSelector } from "react-redux";
import PT from "prop-types";
import { formValueSelector } from "redux-form";

import * as KV from "../../../../../kodeverk";
import LandLinje from "../landlinje/landlinje";
import CheckableLandLinje from "../checkableLandLinje/checkableLandLinje";
import * as Nav from "../../../../../navFrontend";
import * as MPT from "../../../../../proptypes";

const MarginaltArbeid = ({ arbeidsland, redigerbart, marginaltArbeid, oppdaterData }) => {
  const { flereLandUkjentHvilke } = useSelector((state) => formValueSelector(KV.Form.SOKNAD)(state, "soknadsland"));
  const landlinjer = flereLandUkjentHvilke ? (
    <LandLinje land="Flere land. Ikke kjent hvilke" checkbox={{ redigerbart: false, checked: true }} />
  ) : (
    arbeidsland.map(({ land }) => {
      const avklartMarginaltArbeidILand = marginaltArbeid.find(
        (enkeltAvklaring) => enkeltAvklaring.subjektID === land.kode
      );

      const key = `marginaltArbeidslandListe${land.kode}`;
      return (
        <CheckableLandLinje
          landKode={land}
          avklartMarginaltArbeidILand={avklartMarginaltArbeidILand}
          key={key}
          oppdaterData={oppdaterData}
          redigerbart={redigerbart}
        />
      );
    })
  );

  return (
    <Nav.Fieldset legend="Er det marginalt arbeid i noen av landene?">
      <div className="marginaltArbeid">
        <div className="landliste_innhold">
          <div className="land__enkeltlinje">
            <Nav.Typo.UndertekstBold>Land</Nav.Typo.UndertekstBold>
            <Nav.Typo.UndertekstBold className="marginaltArbeidCheckbox">
              Marginalt arbeid? {"(<5%)"}
            </Nav.Typo.UndertekstBold>
          </div>
          {landlinjer}
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
