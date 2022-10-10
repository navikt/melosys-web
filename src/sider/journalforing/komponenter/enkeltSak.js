import React, { Fragment } from "react";
import PT from "prop-types";
import { Link } from "react-router-dom";

import * as KV from "../../../kodeverk";
import * as MPT from "../../../proptypes";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Ikon from "../../../resources/images";

import EnkeltDato from "../../../felleskomponenter/enkeltDato";
import Soknadsland from "../../../felleskomponenter/soknadsland";
import { lagUrl, lagUrlFraBehandlingstema } from "../../../routing";
import { BehandlingsstatusMedSvarfrist } from "../../../felleskomponenter/behandlingsstatus";

import "./enkeltSak.css";

/** Den enkelte sak-elementet som brukes i iterasjon i listen
 */
const EnkeltSak = (props) => {
  const { behandleAlleSakerToggleEnabled, landkoder } = props;
  const { opprettetDato, behandlingOversikter, sakstype, saksstatus, saksnummer, sakstema } = props.sak;

  const { land, behandlingstype, periode, behandlingsstatus, behandlingstema, svarFrist, behandlingID } =
    behandlingOversikter[0];
  const link = behandleAlleSakerToggleEnabled
    ? lagUrl(saksnummer, behandlingID, sakstype.kode, behandlingstema.kode, behandlingstype.kode)
    : lagUrlFraBehandlingstema(saksnummer, behandlingID, behandlingstema.kode);

  if (behandleAlleSakerToggleEnabled) {
    return (
      <div className="enkeltSak">
        <Skjema.CustomRadioPanelElement
          tittel={
            <div className="tittel">
              <span>
                {KV.objektTilTerm(sakstype)} - {KV.objektTilTerm(sakstema)}
              </span>
            </div>
          }
          hoyreSideTittel={
            <div className="sideTittel">
              <Link to={link}>{saksnummer}</Link>
              <Ikon.ExternalLink className="ikon" />
            </div>
          }
          data={[
            { description: KV.objektTilTerm(behandlingstema) },
            { description: <div className="behandlingstype">{KV.objektTilTerm(behandlingstype)}</div> },
            {
              term: "Søknadsperiode:",
              description: periode ? (
                <Fragment>
                  <EnkeltDato dato={periode.fom} /> - <EnkeltDato dato={periode.tom} />
                </Fragment>
              ) : null,
            },
            {
              term: "Land:",
              description: <Soknadsland land={land} visFulltNavn landkoderKodeverk={landkoder} />,
            },
            {
              description: (
                <div className="behandlingsstatusSvarfrist-wrapper">
                  <BehandlingsstatusMedSvarfrist behandlingsstatus={behandlingsstatus} svarFrist={svarFrist} />
                </div>
              ),
            },
          ]}
        />
      </div>
    );
  }

  return (
    <Skjema.CustomRadioPanelElement
      tittel={KV.objektTilTerm(sakstype)}
      data={[
        { term: "Behandlingstype:", description: KV.objektTilTerm(behandlingstype) },
        {
          term: "Søknadsperiode:",
          description: periode ? (
            <Fragment>
              <EnkeltDato dato={periode.fom} /> - <EnkeltDato dato={periode.tom} />
            </Fragment>
          ) : null,
        },
        { term: "Saksstatus:", description: KV.objektTilTerm(saksstatus) },
        { term: "Saksnummer:", description: saksnummer },
        { term: "Land:", description: <Soknadsland land={land} /> },
        { term: "Behandlingsstatus:", description: KV.objektTilTerm(behandlingsstatus) },
        { term: "Opprettet:", description: <EnkeltDato dato={opprettetDato} /> },
      ]}
    />
  );
};

EnkeltSak.propTypes = {
  sak: MPT.Fagsak.isRequired,
  behandleAlleSakerToggleEnabled: PT.bool.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
};

export default EnkeltSak;
