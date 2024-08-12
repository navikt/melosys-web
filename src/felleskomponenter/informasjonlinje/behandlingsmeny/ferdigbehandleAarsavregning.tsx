import Handling from "./handling";
import { BekreftValgTypes } from "../../../modals/bekreftValgTypes";
import { modalerOperations } from "../../../ducks/modaler";
import { useDispatch } from "react-redux";

const FerdigbehandleAarsavregning = () => {
  const dispatch = useDispatch();
  const apneBekreftValgModal = (type: BekreftValgTypes) => dispatch(modalerOperations.visBekreftValg(type));

  return (
    <Handling
      tekst="Ferdigbehandlet"
      onClick={() => apneBekreftValgModal(BekreftValgTypes.FERDIGBEHANDLE_ÅRSAVREGNING)}
    />
  );
};

export default FerdigbehandleAarsavregning;
