import { useContext } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "../hooks";

import { FellesHandlersContext } from "../contexts";
import { modalerOperations, modalerSelectors } from "../ducks/modaler";
import {
  DialogboksAvslagSoknad,
  DialogboksBekreftValg,
  DialogboksHenleggSak,
  DialogboksOppfriskSak,
} from "../felleskomponenter/dialogboks";

function Modals() {
  const fellesHandlers = useContext(FellesHandlersContext) as any;
  const { skjulOppfriskModalOgNavigerTilForside, lagreMottatteOpplysningerOgOppfriskSaksopplysninger } = fellesHandlers;

  const dispatch = useDispatch();

  const visOppfriskDialog = useSelector((state) => modalerSelectors.ErOppfriskSynligSelector(state));
  const visHenleggDialog = useSelector((state) => modalerSelectors.ErHenleggSynligSelector(state));
  const visAvslagSoknadDialog = useSelector((state) => modalerSelectors.ErAvslagSoknadSynligSelector(state));
  const visBekreftValgDialog = useSelector((state) => modalerSelectors.ErBekreftValgSynligSelector(state));

  const skjulOppfriskModal = () => dispatch(modalerOperations.skjulOppfrisk());
  const lukkOppfriskModal = () => {
    dispatch(modalerOperations.skjulOppfrisk());
    dispatch(modalerOperations.fjernBehandlingOppfriskes());
  };
  const skjulHenleggDialogHandle = () => dispatch(modalerOperations.skjulHenlegg());
  const skjulAvslagSoknadDialogHandle = () => dispatch(modalerOperations.skjulAvslagSoknad());

  return (
    <>
      {visOppfriskDialog && (
        <DialogboksOppfriskSak
          oppfrisk={lagreMottatteOpplysningerOgOppfriskSaksopplysninger}
          avbryt={skjulOppfriskModal}
          lukk={lukkOppfriskModal}
          tilForsiden={skjulOppfriskModalOgNavigerTilForside}
        />
      )}
      {visHenleggDialog && <DialogboksHenleggSak avbryt={skjulHenleggDialogHandle} />}
      {visAvslagSoknadDialog && <DialogboksAvslagSoknad avbryt={skjulAvslagSoknadDialogHandle} />}
      {visBekreftValgDialog && <DialogboksBekreftValg />}
    </>
  );
}

export default Modals;
