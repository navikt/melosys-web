import { useDispatch } from "react-redux";
import { useEffect } from "react";
import PT from "prop-types";
import { reset } from "redux-form";

import { konverterAvklartfaktaTilStegData, lagAvklartfakta } from "../../../../../felleskomponenter/stegvelger";
import MKV from "../../../../../melosyskodeverk";
import { BOOLSK_STRING } from "../../../../../constants";
import * as KV from "../../../../../kodeverk";
import LandLinje from "../landlinje/landlinje";
import * as MPT from "../../../../../proptypes";

/**
 * Enkeltsjekkboks for marginalt arbeid i et land.
 *
 * @param props Objekt Diverse props (se propTypes)
 */
const CheckableLandLinje = (props) => {
  const { landKode, avklartMarginaltArbeidILand, oppdaterData, redigerbart } = props;
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

  const klikkHandler = () => {
    const verdi = erMarginaltArbeidIArbeidsland ? BOOLSK_STRING.USANN : BOOLSK_STRING.SANN;
    oppdaterData(lagAvklartfakta(MKV.Koder.avklartefaktatyper.MARGINALT_ARBEID, landKode.kode, verdi));

    /* Ved valg av marginale land(skal ikke ha SED), reinitialize former med mottakerinstitusjoner,
    slik at mottakerinstitusjoner i vedtakssteget/utpekingssteg oppdateres.
    Unngår at bruker må endre på radioknapp "Vurdering av vesentlig aktivitet i Norge" for å oppdatere de nevnte stegene. */
    dispatch(reset(KV.Form.ARTIKKEL_13_X_VEDTAK));
    dispatch(reset(KV.Form.ARTIKKEL_13_UTPEKLAND));
  };

  return (
    <LandLinje
      land={`${landKode.term} (${landKode.kode})`}
      checkbox={{
        redigerbart,
        checked: erMarginaltArbeidIArbeidsland === true,
        value: BOOLSK_STRING.SANN,
        onCheck: klikkHandler,
      }}
    />
  );
};

CheckableLandLinje.propTypes = {
  oppdaterData: PT.func.isRequired,
  landKode: MPT.Kodeverk.isRequired,
  avklartMarginaltArbeidILand: PT.object,
  redigerbart: PT.bool.isRequired,
};

CheckableLandLinje.defaultProps = {
  avklartMarginaltArbeidILand: undefined,
};

export default CheckableLandLinje;
