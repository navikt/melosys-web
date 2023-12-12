import { useEffect, useState } from "react";
import PT from "prop-types";
import * as EKV from "eessi-kodeverk";
import { connect } from "react-redux";

import * as Nav from "../../../navFrontend";
import * as Mui from "../../../felleskomponenter/ui";
import * as Hooks from "../../../hooks";
import * as Utils from "../../../utils";

import Dokumentliste from "../../../felleskomponenter/dokumentliste";

import { formSelectors } from "../../../ducks/form";

import "./vurderingGodkjennUtpekingAnnetLand.css";
import * as Api from "../../../services/api";

export const VurderingGodkjennUtpekingAnnetLand = ({
  lagreOgGodkjennUnntaksperioder,
  redigerbart,
  overskrift,
  behandlingID,
  vurderUtpekingFormValues,
  tilbake,
}) => {
  const [varsleUtland, setVarsleUtland] = useState(false);
  const [godkjenningPending, setGodkjenningPending] = useState(false);
  const [fritekst, setFritekst] = useState("");
  const [erBucAapen, setErBucAapen] = useState(true);

  const isMounted = Hooks.useIsMounted();

  useEffect(() => {
    Api.Kontroll.erBucAapen(behandlingID).then((res) => {
      setErBucAapen(res);
    });
  }, []);

  const sendA012CheckHandler = ({ checked }) => {
    setVarsleUtland(checked);
  };

  const hovedknappClickHandler = async () => {
    setGodkjenningPending(true);

    try {
      const { fom, tom } = vurderUtpekingFormValues;
      const endretPeriode =
        fom && tom
          ? {
              fom: fom && Utils.dato.formatterDatoTilISO(fom),
              tom: tom && Utils.dato.formatterDatoTilISO(tom),
            }
          : null;

      await lagreOgGodkjennUnntaksperioder({
        varsleUtland,
        fritekst,
        endretPeriode,
        lovvalgsbestemmelse: vurderUtpekingFormValues.lovvalgsbestemmelse,
      });
    } catch (e) {
      setGodkjenningPending(false);
    }

    // godkjenn-operation navigerer til forside, og komponenten kan derfor være unmountet.
    if (isMounted.current) {
      setGodkjenningPending(false);
    }
  };

  const dokumenter = [
    {
      type: EKV.Koder.sedtyper.A012,
      sedData: { fritekst },
    },
  ];
  const skjemaDisabled = !redigerbart || !erBucAapen;

  return (
    <div className="vurderingGodkjennUtpeking">
      {!erBucAapen ? (
        <Nav.AlertStripe className="buc__varsel" type="advarsel">
          <strong>BUC er lukket</strong>
          <ul>
            <li>Det kan ikke sendes SED A012. Perioden blir likevel lagret i Melosys og overført til Medl.</li>
          </ul>
        </Nav.AlertStripe>
      ) : null}
      <Nav.Typo.Innholdstittel className="stegvelgertittel">{overskrift}</Nav.Typo.Innholdstittel>
      {redigerbart && (
        <>
          <Nav.Row className="sendA012">
            <Nav.Column xs="12">
              <Mui.Checkbox disabled={skjemaDisabled} label="Send A012" onCheck={sendA012CheckHandler} />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Textarea
              label="Ytterligere informasjon til SED (valgfri)"
              value={fritekst}
              onChange={(e) => setFritekst(e.target.value)}
              maxLength={500}
              disabled={skjemaDisabled}
            />
          </Nav.Row>
          <Nav.Row>{erBucAapen && <Dokumentliste behandlingID={behandlingID} dokumenter={dokumenter} />}</Nav.Row>
        </>
      )}
      <Nav.Row>
        <Nav.Column xs="6" className="fane__fot">
          <Mui.StegKnapper
            bekreftKnappProps={{
              spinner: godkjenningPending,
              autoDisableVedSpinner: true,
              disabled: !redigerbart,
              onClick: hovedknappClickHandler,
            }}
            bekreftTekst="Bekreft"
            tilbakeKnappProps={{
              onClick: tilbake,
              disabled: !redigerbart,
            }}
          />
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};

const mapStateToProps = (state) => ({
  vurderUtpekingFormValues: formSelectors.VurderUtpekingFormValuesSelector(state),
});

VurderingGodkjennUtpekingAnnetLand.propTypes = {
  lagreOgGodkjennUnntaksperioder: PT.func.isRequired,
  tilbake: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  overskrift: PT.string.isRequired,
  behandlingID: PT.number.isRequired,
  vurderUtpekingFormValues: PT.object.isRequired,
};

export default connect(mapStateToProps)(VurderingGodkjennUtpekingAnnetLand);
