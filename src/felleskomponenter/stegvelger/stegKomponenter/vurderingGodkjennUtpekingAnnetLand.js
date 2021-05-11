import React, { Fragment, useState } from "react";
import PT from "prop-types";
import * as EKV from "eessi-kodeverk";

import * as Nav from "../../../utils/navFrontend";
import * as Mui from "../../ui";
import * as Hooks from "../../../hooks";

import PdfLenkeListe from "../../../felleskomponenter/pdfLenkeListe";

import "./vurderingGodkjennUtpekingAnnetLand.css";

const VurderingGodkjennUtpekingAnnetLand = ({
  lagreOgGodkjennUnntaksperioder,
  redigerbart,
  overskrift,
  behandlingID,
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

    await lagreOgGodkjennUnntaksperioder({
      varsleUtland,
      fritekst,
    });

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
          <Mui.Knapp
            type="hoved"
            spinner={godkjenningPending}
            autoDisableVedSpinner
            disabled={!redigerbart}
            onClick={hovedknappClickHandler}
          >
            Bekreft
          </Mui.Knapp>
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

VurderingGodkjennUtpekingAnnetLand.propTypes = {
  lagreOgGodkjennUnntaksperioder: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  overskrift: PT.string.isRequired,
  behandlingID: PT.number.isRequired,
};

export default VurderingGodkjennUtpekingAnnetLand;
