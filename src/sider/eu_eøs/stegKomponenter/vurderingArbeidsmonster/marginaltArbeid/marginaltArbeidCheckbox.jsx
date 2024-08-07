import { useDispatch } from "react-redux";
import { useEffect } from "react";
import {
  konverterAvklartfaktaTilStegData,
  lagAvklartfakta,
} from "../../../../../felleskomponenter/stegvelger/index.js";
import MKV from "../../../../../melosyskodeverk/index.js";
import { BOOLSK_STRING } from "../../../../../constants.js";
import { reset } from "redux-form";
import * as KV from "../../../../../kodeverk/index.js";
import PT from "prop-types";
import * as MPT from "../../../../../proptypes/index.js";
import * as Nav from "../../../../../navFrontend/index.js";

const MarginaltArbeidCheckbox = (props) => {
  const { arbeidsland, avklartMarginaltArbeidILand, oppdaterData } = props;
  const dispatch = useDispatch();

  useEffect(() => {
    if (avklartMarginaltArbeidILand) {
      oppdaterData(
        konverterAvklartfaktaTilStegData(MKV.Koder.avklartefaktatyper.MARGINALT_ARBEID, avklartMarginaltArbeidILand)
      );
    }
  }, []);

  const erMarginaltArbeidIArbeidsland =
    avklartMarginaltArbeidILand && avklartMarginaltArbeidILand.fakta.includes("TRUE");

  const oppdaterDataOnCheck = () => {
    const verdi = erMarginaltArbeidIArbeidsland ? BOOLSK_STRING.USANN : BOOLSK_STRING.SANN;
    oppdaterData(lagAvklartfakta(MKV.Koder.avklartefaktatyper.MARGINALT_ARBEID, arbeidsland.kode, verdi));

    /* Ved valg av marginale land(skal ikke ha SED), reinitialize former med mottakerinstitusjoner,
    slik at mottakerinstitusjoner i vedtakssteget/utpekingssteg oppdateres.
    Unngår at bruker må endre på radioknapp "Vurdering av vesentlig aktivitet i Norge" for å oppdatere de nevnte stegene. */
    dispatch(reset(KV.Form.ARTIKKEL_13_X_VEDTAK));
    dispatch(reset(KV.Form.ARTIKKEL_13_UTPEKLAND));
  };

  return (
    <Nav.Checkbox
      value={arbeidsland.kode}
      id={`marginaltArbeidslandListe.${arbeidsland.kode}`}
      key={`marginaltArbeidslandListe.${arbeidsland.kode}`}
      checked={erMarginaltArbeidIArbeidsland}
      onChange={(changeEvent) => oppdaterDataOnCheck(changeEvent)}
    >
      {arbeidsland.term}
    </Nav.Checkbox>
  );
};

MarginaltArbeidCheckbox.propTypes = {
  oppdaterData: PT.func.isRequired,
  arbeidsland: MPT.Kodeverk.isRequired,
  avklartMarginaltArbeidILand: PT.object,
};

MarginaltArbeidCheckbox.defaultProps = {
  avklartMarginaltArbeidILand: undefined,
};

export default MarginaltArbeidCheckbox;
