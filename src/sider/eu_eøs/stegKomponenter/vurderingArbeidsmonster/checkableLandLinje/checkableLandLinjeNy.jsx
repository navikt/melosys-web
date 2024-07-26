import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { konverterAvklartfaktaTilStegData, lagAvklartfakta } from "../../../../../felleskomponenter/stegvelger";
import MKV from "../../../../../melosyskodeverk";
import { BOOLSK_STRING } from "../../../../../constants";
import { reset } from "redux-form";
import * as KV from "../../../../../kodeverk";
import PT from "prop-types";
import * as MPT from "../../../../../proptypes";
import * as Nav from "../../../../../navFrontend";

const CheckableLandLinjeNy = (props) => {
  const { land, avklartMarginaltArbeidILand, oppdaterData, redigerbart } = props;
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("land: " + JSON.stringify(land));
    if (avklartMarginaltArbeidILand) {
      oppdaterData(
        konverterAvklartfaktaTilStegData(MKV.Koder.avklartefaktatyper.MARGINALT_ARBEID, avklartMarginaltArbeidILand)
      );
    }
  }, []);

  const erMarginaltArbeidIArbeidsland =
    avklartMarginaltArbeidILand && avklartMarginaltArbeidILand.fakta.includes("TRUE");

  const oppdaterDataOnCheck = (changeEvent) => {
    console.log("oppdaterer data");
    if (!changeEvent.target.checked) {
      console.log("!checked");
    }
    const verdi = erMarginaltArbeidIArbeidsland ? BOOLSK_STRING.USANN : BOOLSK_STRING.SANN;
    oppdaterData(lagAvklartfakta(MKV.Koder.avklartefaktatyper.MARGINALT_ARBEID, land.kode, verdi));

    /* Ved valg av marginale land(skal ikke ha SED), reinitialize former med mottakerinstitusjoner,
    slik at mottakerinstitusjoner i vedtakssteget/utpekingssteg oppdateres.
    Unngår at bruker må endre på radioknapp "Vurdering av vesentlig aktivitet i Norge" for å oppdatere de nevnte stegene. */
    dispatch(reset(KV.Form.ARTIKKEL_13_X_VEDTAK));
    dispatch(reset(KV.Form.ARTIKKEL_13_UTPEKLAND));
  };

  return (<Nav.Checkbox
    size="small"
    value={land.kode}
    id={`marginaltArbeidslandListe.${land.kode}`}
    key={`marginaltArbeidslandListe.${land.kode}`}
    onChange={(changeEvent) => oppdaterDataOnCheck(changeEvent)}
  >
    {land.term}
  </Nav.Checkbox>);
};

CheckableLandLinjeNy.propTypes = {
  oppdaterData: PT.func.isRequired,
  land: MPT.Kodeverk.isRequired,
  avklartMarginaltArbeidILand: PT.object,
  redigerbart: PT.bool.isRequired
};

CheckableLandLinjeNy.defaultProps = {
  avklartMarginaltArbeidILand: undefined
};

export default CheckableLandLinjeNy;

