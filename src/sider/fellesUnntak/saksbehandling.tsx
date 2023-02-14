/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-file @typescript-eslint/no-unused-vars

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import Informasjonlinje from "../../felleskomponenter/informasjonlinje";
import * as Nav from "../../navFrontend";
import { SoknadMenypanelForm } from "../../felleskomponenter/menypanelForm";
import Oppsummering from "../../felleskomponenter/oppsummering";
import SaksoversiktLenke from "../../felleskomponenter/saksoversiktLenke";
import SideDialog, { defaultFaner } from "../../felleskomponenter/sideDialog";
import * as Utils from "../../utils";
import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../ducks/mottatteOpplysninger";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../ducks/lovvalgsperioder";
import { MatchParams } from "../../@types";
import { fagsakOperations } from "../../ducks/fagsaker";
import { behandlingsresultatOperations } from "../../ducks/behandlingsresultat";
import { behandlingerOperations, behandlingerSelectors } from "../../ducks/behandlinger";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import "./saksbehandling.css";
import { dokumenterOperations } from "../../ducks/dokumenter";
import { navigeringOperations } from "../../ducks/navigering";
import StegVelger from "./stegVelger";

interface SaksbehandlingProps extends RouteComponentProps<MatchParams> {
  visOppfriskModal: () => void;
  behandlingOppfriskes: boolean;
  startOgVisOppfriskModal: () => void;
}

const Saksbehandling = ({
  location,
  match,
  visOppfriskModal,
  behandlingOppfriskes,
  startOgVisOppfriskModal,
}: SaksbehandlingProps) => {
  const dispatch = useDispatch();

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const [saksopplysningerLastet, setSaksopplysningerLastet] = useState(false);
  const saksnummer = match?.params?.saksnr;
  const arbeidsland = useSelector(mottatteOpplysningerSelectors.SoknadslandKTSelector);
  const mottatteOpplysningerPeriode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const lovvalgsperiodeTom = Utils.dato.formatterDatoTilNorsk(useSelector(lovvalgsperioderSelectors.TomDatoSelector));
  const mottatteOpplysningerPeriodeFom = Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerPeriode.fom);
  const mottatteOpplysningerPeriodeTom = Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerPeriode.tom);
  const redigerbart = useSelector((state) => redigerbartSelectors.RedigerbartSelector(state));

  const tilForsiden = () => dispatch(navigeringOperations.tilForsiden());

  useEffect(() => {
    lastInnSaksopplysninger();
  }, []);

  const lastInnSaksopplysninger = async () => {
    const behandlingIDFraParam = Utils._toInteger(Utils.queryString.getParam(location, "behandlingID"));

    try {
      await dispatch(fagsakOperations.hent(saksnummer));
      const response = await dispatch(behandlingerOperations.hentBehandling(behandlingIDFraParam));

      if (!response) return false;

      await dispatch(behandlingsresultatOperations.hent(behandlingIDFraParam));

      if (behandlingOppfriskes) {
        visOppfriskModal();
        return false;
      }

      await dispatch(mottatteOpplysningerOperations.hent(behandlingIDFraParam));
      await dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer));
      await dispatch(lovvalgsperioderOperations.hent(behandlingIDFraParam));
      setSaksopplysningerLastet(true);
      return true;
    } catch (e) {
      Utils.logger.error(e);
    }
    return false;
  };

  if (Utils._isNil(redigerbart)) return null;
  if (!behandlingID) return null;
  if (!saksopplysningerLastet) return null;

  return (
    <>
      <Informasjonlinje />
      <div id="main-container" className="main-container">
        <div className="trygdeavtale_saksbehandling">
          <Nav.Container fluid>
            <Nav.Row>
              <Nav.Column xs="7">
                {/* Stegvelger  */}
                <StegVelger />
                <SoknadMenypanelForm startOgVisOppfriskModal={startOgVisOppfriskModal} />
              </Nav.Column>
              <Nav.Column xs="5">
                <Oppsummering
                  arbeidsland={arbeidsland}
                  lovvalgsperiodeFom={mottatteOpplysningerPeriodeFom || ""}
                  lovvalgsperiodeTom={lovvalgsperiodeTom || mottatteOpplysningerPeriodeTom || ""}
                  mottatteOpplysningerPeriodeFom="asd"
                  mottatteOpplysningerPeriodeTom="asd"
                />
                <SaksoversiktLenke />
                <SideDialog faner={defaultFaner} />
              </Nav.Column>
            </Nav.Row>
          </Nav.Container>
        </div>
      </div>
    </>
  );
};

export default Saksbehandling;
