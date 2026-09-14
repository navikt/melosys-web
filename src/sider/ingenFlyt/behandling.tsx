import { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { RouteComponentProps } from "react-router-dom";

import MKV from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";
import { MatchParams } from "../../@types";

import { behandlingerSelectors } from "../../ducks/behandlinger";
import { fagsakSelectors } from "../../ducks/fagsaker";
import { mottatteOpplysningerSelectors } from "../../ducks/mottatteOpplysninger";
import { datalastingOperations } from "../../ducks/datalasting";
import { redigerbartSelectors } from "../../ducks/redigerbart";

import Informasjonlinje from "../../felleskomponenter/informasjonlinje";
import { SoknadMenypanelForm } from "../../felleskomponenter/menypanelForm";
import Oppsummering from "../../felleskomponenter/oppsummering";
import SaksoversiktLenke from "../../felleskomponenter/saksoversiktLenke";
import { Innsynsmelding, IngenFlytMelding, VirksomhetMelding } from "../../felleskomponenter/alertmeldinger";
import SideDialog, { defaultTabs, tabsUtenBucOgSed } from "../../felleskomponenter/sideDialog";

import "./behandling.less";
import { AvslaattPgaManglendeOpplysninger, HenlagtSak } from "../eu_eøs/saksbehandling/komponenter/stegErstatter";
import { behandlingsresultatSelectors } from "../../ducks/behandlingsresultat";

const mapStateToProps = (state: RootState) => ({
  arbeidsland: mottatteOpplysningerSelectors.SoknadslandKTSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  behandlingsresultatType: behandlingsresultatSelectors.BehandlingsresultatTypeSelector(state),
  fagsakStatus: fagsakSelectors.FagsakStatusSelector(state),
  hovedpartRolle: fagsakSelectors.HovedpartRolleSelector(state),
  mottatteOpplysningerPeriodeFom: Utils.dato.formatterDatoTilNorsk(
    mottatteOpplysningerSelectors.PeriodeFomSelector(state),
  ),
  mottatteOpplysningerPeriodeTom: Utils.dato.formatterDatoTilNorsk(
    mottatteOpplysningerSelectors.PeriodeTomSelector(state),
  ),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  lastInnSaksopplysninger: (saksnummer: string, behandlingID: number) =>
    dispatch(datalastingOperations.lastInnSaksopplysningerIngenFlyt(saksnummer, behandlingID)),
  resetSaksopplysninger: () => dispatch(datalastingOperations.resetSaksopplysninger()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props extends RouteComponentProps<MatchParams> {}

function Behandling({
  arbeidsland,
  behandlingstema,
  behandlingsresultatType,
  fagsakStatus,
  hovedpartRolle,
  lastInnSaksopplysninger,
  location,
  match: {
    params: { saksnr: saksnummer, sakstype },
  },
  mottatteOpplysningerPeriodeFom,
  mottatteOpplysningerPeriodeTom,
  redigerbart,
  resetSaksopplysninger,
}: Props & PropsFromRedux) {
  const behandlingID = Utils._toInteger(Utils.queryString.getParam(location, "behandlingID"));
  const saksopplysningerErLastet = !!behandlingstema;

  useEffect(() => {
    return () => {
      resetSaksopplysninger();
    };
  }, []);

  useEffect(() => {
    lastInnSaksopplysninger(saksnummer, behandlingID);
  }, [sakstype]);

  if (Utils._isNil(redigerbart)) return null;
  if (!behandlingID) return null;
  if (!saksopplysningerErLastet) return null;

  const hovedpartErVirksomhet = hovedpartRolle === MKV.Koder.aktoersroller.VIRKSOMHET;
  const erHenlagtSak = fagsakStatus === MKV.Koder.saksstatuser.HENLAGT;
  const erAvslåttPgaManglendeOpplysninger =
    behandlingsresultatType === MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL;
  const visAvslåttPgaManglendeOpplysninger = erAvslåttPgaManglendeOpplysninger && !erHenlagtSak;

  const visTomFlytMelding = !erAvslåttPgaManglendeOpplysninger && !erHenlagtSak;

  return (
    <>
      <Informasjonlinje />
      <div className="main-container">
        <Nav.Container fluid className="ingenFlyt_behandling">
          <Nav.Row>
            <Nav.Column xs="7">
              {!redigerbart && <Innsynsmelding className="ingenFlyt_behandling__innsynsmelding" />}
              {hovedpartErVirksomhet ? (
                <main id="main-container">
                  <VirksomhetMelding />
                </main>
              ) : (
                <>
                  <main id="main-container">
                    {erHenlagtSak && <HenlagtSak />}
                    {visAvslåttPgaManglendeOpplysninger && <AvslaattPgaManglendeOpplysninger />}
                    {visTomFlytMelding && <IngenFlytMelding />}
                  </main>
                  <SoknadMenypanelForm startOgVisOppfriskModal={() => null} visOppdaterRegisteropplysninger={false} />
                </>
              )}
            </Nav.Column>
            <Nav.Column xs="5">
              <Oppsummering
                arbeidsland={arbeidsland}
                mottatteOpplysningerPeriodeFom={mottatteOpplysningerPeriodeFom}
                mottatteOpplysningerPeriodeTom={mottatteOpplysningerPeriodeTom}
              />
              <SaksoversiktLenke />
              <SideDialog tabs={hovedpartErVirksomhet ? tabsUtenBucOgSed : defaultTabs} />
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </div>
    </>
  );
}

export default connector(Behandling);
