import React, { useEffect, useState } from "react";
import PT from "prop-types";
import { connect } from "react-redux";

import MKV from "../../../melosyskodeverk";

import * as Nav from "../../../navFrontend";
import * as Ikon from "../../../resources/images";

import PdfLenkeListe from "../../pdfLenkeListe";
import Knapperad from "../../knapperad";

import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../ducks/redigerbart";

import "./dialogboksAvslagSoknad.css";
import { DokumenterV2 } from "../../../services/api";
import { FeatureToggle } from "../../../featuretoggle";
import HtmlEditor from "../../htmlEditor";

export const DialogboksAvslagSoknad = (props) => {
  const [brevFritekst, setBrevFritekst] = useState("");
  const [brukerMottaker, setBrukerMottaker] = useState({});

  const { ariaHideApp, avbryt, behandlingID, redigerbart, avslaaSoknadHandle } = props;

  useEffect(() => {
    DokumenterV2.hentTilgjengeligeMaler(behandlingID).then((response) => {
      const mangelbrevBrukerMal = response.find(
        (mal) => mal.type?.kode === MKV.Koder.brev.produserbaredokumenter.MANGELBREV_BRUKER
      );
      setBrukerMottaker(
        mangelbrevBrukerMal?.muligeMottakere?.find((mottaker) => mottaker.rolle === MKV.Koder.aktoersroller.BRUKER)
      );
    });
  }, []);

  const pdfDokumenter = [
    {
      navn: "Forhåndsvis vedtaksbrev",
      type: MKV.Koder.brev.produserbaredokumenter.AVSLAG_MANGLENDE_OPPLYSNINGER,
      data: {
        begrunnelseKode: MKV.Koder.begrunnelser.folketrygdloven.avslag.MANGLENDE_OPPLYSNINGER,
        fritekst: brevFritekst,
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      },
    },
  ];

  const avslaaSoknad = () => {
    const data = {
      fritekst: brevFritekst,
    };
    avslaaSoknadHandle(data);
  };
  const brevFritekstMaxLength = 500;
  const mottakerFeil = brukerMottaker?.feilmelding;
  const bekreftRedigerbart = !mottakerFeil && brevFritekst.length <= brevFritekstMaxLength;

  return (
    <Nav.Modal
      className="dialogboksAvslagSoknad"
      isOpen
      contentLabel="Avslå søknad"
      onRequestClose={avbryt}
      closeButton={false}
      shouldCloseOnOverlayClick
      ariaHideApp={ariaHideApp}
    >
      <div className="avslagsoknadcontainer">
        <Ikon.VedtakGodkjent className="vedtakIkon" />
        <div>
          <Nav.Typo.Systemtittel className="overskrift">
            Avslå søknaden på grunn av manglende opplysninger
          </Nav.Typo.Systemtittel>
          {mottakerFeil && <Nav.AlertStripeFeil>{mottakerFeil}</Nav.AlertStripeFeil>}
          <FeatureToggle togglename="melosys.brev.AVSLAG_MANGLENDE_OPPLYSNINGER">
            {(toggleStatus) =>
              toggleStatus === "enabled" ? (
                <HtmlEditor value={brevFritekst} onChange={setBrevFritekst} label="Fritekst til vedtaksbrev" />
              ) : (
                <Nav.Textarea
                  value={brevFritekst}
                  onChange={(event) => setBrevFritekst(event.target.value)}
                  label="Fritekst til vedtaksbrev"
                  maxLength={brevFritekstMaxLength}
                />
              )
            }
          </FeatureToggle>
          {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
          <div className="knapperadcontainer">
            <Knapperad
              avbryt={avbryt}
              avbrytTekst="AVBRYT"
              bekreft={avslaaSoknad}
              bekreftTekst="AVSLÅ SØKNAD"
              redigerbart={redigerbart}
              bekreftRedigerbart={bekreftRedigerbart}
            />
          </div>
        </div>
      </div>
    </Nav.Modal>
  );
};

DialogboksAvslagSoknad.propTypes = {
  avslaaSoknadHandle: PT.func.isRequired,
  avbryt: PT.func.isRequired,
  ariaHideApp: PT.bool,
  behandlingID: PT.number.isRequired,
  redigerbart: PT.bool.isRequired,
};

DialogboksAvslagSoknad.defaultProps = {
  ariaHideApp: true,
};

const mapStateToProps = (state) => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

export default connect(mapStateToProps)(DialogboksAvslagSoknad);
