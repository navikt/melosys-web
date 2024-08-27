import Handling from "./handling";
import { BekreftValgTypes } from "../../../modals/bekreftValgTypes";
import { modalerOperations } from "../../../ducks/modaler";
import { useDispatch } from "react-redux";

const AvsluttAarsavregning = () => {
  const dispatch = useDispatch();
  const apneBekreftValgModal = (type: BekreftValgTypes) => dispatch(modalerOperations.visBekreftValg(type));

  return (
    <>
      <Handling tekst="Ferdigbehandlet" onClick={() => apneBekreftValgModal(BekreftValgTypes.FERDIGBEHANDLET)} />
      <Handling
        tekst="Behandlingen er bortfalt"
        onClick={() => apneBekreftValgModal(BekreftValgTypes.AVSLUTT_SAK_SOM_BORTFALT)}
      />
    </>
  );
};

export default AvsluttAarsavregning;
