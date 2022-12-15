import React, { Fragment } from "react";
import PT from "prop-types";

import { MKVUtils } from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";
import * as MPT from "../../../proptypes";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Ikon from "../../../resources/images";
import * as Nav from "../../../navFrontend";
import { URL_BASENAME } from "../../../constants";

import EnkeltDato from "../../../felleskomponenter/enkeltDato";
import Soknadsland from "../../../felleskomponenter/soknadsland";
import { lagUrl, lagUrlFraBehandlingstema } from "../../../routing";
import { BehandlingsstatusMedSvarfrist } from "../../../felleskomponenter/behandlingsstatus";

import "./enkeltSak.css";
import { useFeatureToggle } from "../../../featuretoggle";

/** Den enkelte sak-elementet som brukes i iterasjon i listen
 */
const EnkeltSak = (props) => {
  const folketrygdenToggleEnabled = useFeatureToggle("melosys.folketrygden.mvp") === "enabled";
  const { behandleAlleSakerToggleEnabled, landkoder } = props;
  const { opprettetDato, behandlingOversikter, sakstype, saksstatus, saksnummer, sakstema } = props.sak;

  const { behandlingstype, behandlingsstatus, behandlingstema, svarFrist, behandlingID } = behandlingOversikter[0];
  const { soknadsperiode, land } =
    behandlingOversikter.find((behandlingOversikt) => behandlingOversikt.soknadsperiode != null) ?? {};
  const { lovvalgsperiode } =
    behandlingOversikter.find((behandlingOversikt) => behandlingOversikt.lovvalgsperiode != null) ?? {};

  const link = behandleAlleSakerToggleEnabled
    ? lagUrl(
        saksnummer,
        behandlingID,
        sakstype.kode,
        sakstema.kode,
        behandlingstema.kode,
        behandlingstype.kode,
        folketrygdenToggleEnabled
      )
    : lagUrlFraBehandlingstema(saksnummer, behandlingID, behandlingstema.kode);

  if (behandleAlleSakerToggleEnabled) {
    const periode = MKVUtils.erAvsluttetEllerMidlertidigBeslutning(behandlingsstatus?.kode)
      ? lovvalgsperiode
      : soknadsperiode;
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
            <Nav.Lenker target="_blank" href={`${URL_BASENAME}${link}`} className="saklenke">
              {saksnummer}
              <Ikon.ExternalLink className="ikon" />
            </Nav.Lenker>
          }
          data={[
            { description: KV.objektTilTerm(behandlingstema) },
            { description: <div className="behandlingstype">{KV.objektTilTerm(behandlingstype)}</div> },
            {
              term: "Periode:",
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
          description: soknadsperiode ? (
            <Fragment>
              <EnkeltDato dato={soknadsperiode.fom} /> - <EnkeltDato dato={soknadsperiode.tom} />
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
