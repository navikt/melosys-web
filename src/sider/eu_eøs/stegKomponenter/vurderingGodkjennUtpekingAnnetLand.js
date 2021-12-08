import React, { Fragment, useState } from "react";
import PT from "prop-types";
import * as EKV from "eessi-kodeverk";
import { connect } from "react-redux";

import * as Nav from "../../../navFrontend";
import * as Mui from "../../../felleskomponenter/ui";
import * as Hooks from "../../../hooks";
import * as Utils from "../../../utils";

import PdfLenkeListe from "../../../felleskomponenter/pdfLenkeListe";

import { formSelectors } from "../../../ducks/form";

import "./vurderingGodkjennUtpekingAnnetLand.css";

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
  const isMounted = Hooks.useIsMounted();

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
      navn: "Forhåndsvis SED A012",
      type: EKV.Koder.sedtyper.A012,
      erSed: true,
      data: { fritekst },
    },
  ];

  return (
    <Fragment>
      <Nav.Typo.Undertittel>{overskrift}</Nav.Typo.Undertittel>
      {redigerbart && (
        <>
          <Nav.Row className="sendA012">
            <Nav.Column xs="12">
              <Mui.Checkbox label="Send A012" onCheck={sendA012CheckHandler} />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Textarea
              label="Ytterligere informasjon til SED (valgfri)"
              value={fritekst}
              onChange={(e) => setFritekst(e.target.value)}
              maxLength={500}
            />
          </Nav.Row>
          <Nav.Row>
            <PdfLenkeListe behandlingID={behandlingID} dokumenter={dokumenter} />
          </Nav.Row>
        </>
      )}
      <Nav.Row>
        <Nav.Column xs="6" className="fane__fot">
          <Mui.StegKnapper
            bekreftKnappProps={{
              type: "hoved",
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
    </Fragment>
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
