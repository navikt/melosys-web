import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps } from "react-router-dom";

import MKV from "../../melosyskodeverk";
import * as KV from "../../kodeverk";
import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";

import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../ducks/mottatteOpplysninger";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../ducks/lovvalgsperioder";
import { behandlingerOperations, behandlingerSelectors } from "../../ducks/behandlinger";
import { behandlingsresultatOperations } from "../../ducks/behandlingsresultat";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { dokumenterOperations } from "../../ducks/dokumenter";
import { fagsakOperations } from "../../ducks/fagsaker";

import { SoknadMenypanelForm } from "../../felleskomponenter/menypanelForm";
import SaksoversiktLenke from "../../felleskomponenter/saksoversiktLenke";
import Informasjonlinje from "../../felleskomponenter/informasjonlinje";
import SideDialog, { defaultFaner } from "../../felleskomponenter/sideDialog";
import Oppsummering from "../../felleskomponenter/oppsummering";

import { MatchParams } from "../../@types";
import StegVelger from "./stegVelger";
import "./saksbehandling.css";

interface SaksbehandlingProps extends RouteComponentProps<MatchParams> {
  visOppfriskModal: () => void;
  behandlingOppfriskes: boolean;
  startOgVisOppfriskModal: () => void;
  oppfriskOgLastInnSaksopplysninger: () => {};
}

const Saksbehandling = ({
  location,
  match,
  visOppfriskModal,
  behandlingOppfriskes,
  startOgVisOppfriskModal,
  oppfriskOgLastInnSaksopplysninger,
}: SaksbehandlingProps) => {
  const dispatch = useDispatch();

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const [saksopplysningerLastet, setSaksopplysningerLastet] = useState(false);
  const saksnummer = match?.params?.saksnr;
  const soknadsland = useSelector(mottatteOpplysningerSelectors.SoknadslandKTSelector);
  const mottatteOpplysningerPeriode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const lovvalgsperiode = useSelector(lovvalgsperioderSelectors.LovvalgsperiodeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const registeropplysningerHentet = useSelector(behandlingerSelectors.SisteOpplysningerHentetDatoSelector);

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
                <StegVelger oppfriskOgLastInnSaksopplysninger={oppfriskOgLastInnSaksopplysninger} />
                {registeropplysningerHentet && (
                  <SoknadMenypanelForm startOgVisOppfriskModal={startOgVisOppfriskModal} />
                )}
              </Nav.Column>
              <Nav.Column xs="5">
                <Oppsummering
                  arbeidsland={soknadsland}
                  lovvalgsland={KV.kodeTilObjekt(lovvalgsperiode.lovvalgsland, MKV.KTObjects.landkoder)}
                  lovvalgsperiodeFom={Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fomDato)}
                  lovvalgsperiodeTom={Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tomDato)}
                  mottatteOpplysningerPeriodeFom={Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerPeriode.fom)}
                  mottatteOpplysningerPeriodeTom={Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerPeriode.tom)}
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
