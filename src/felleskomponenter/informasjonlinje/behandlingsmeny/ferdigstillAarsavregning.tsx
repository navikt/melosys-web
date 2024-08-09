import Handling from "./handling";
import { BekreftValgTypes } from "../../../modals/bekreftValgTypes";
import { modalerOperations } from "../../../ducks/modaler";
import { useDispatch } from "react-redux";

const FerdigstillAarsavregning = () => {
  const dispatch = useDispatch();
  const apneBekreftValgModal = (type: BekreftValgTypes) => dispatch(modalerOperations.visBekreftValg(type));

  return (
    <Handling
      tekst="Ferdigbehandlet"
      onClick={() => apneBekreftValgModal(BekreftValgTypes.FERDIGSTILL_AARSAVREGNING)}
    />
  );
};

export default FerdigstillAarsavregning;
