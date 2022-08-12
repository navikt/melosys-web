import React, { Fragment } from "react";
import PT from "prop-types";

import * as KV from "../../../kodeverk";
import * as MPT from "../../../proptypes";
import * as Skjema from "../../../felleskomponenter/skjema";

import EnkeltDato from "../../../felleskomponenter/datoOmrade/enkeltDato";
import Soknadsland from "../../../felleskomponenter/soknadsland";
import Behandlingsstatuskode from "../../../felleskomponenter/behandlingsstatuskode";
import { formatterDatoTilNorsk } from "../../../utils/dato";

import "./enkeltSak.css";

/** Den enkelte sak-elementet som brukes i iterasjon i listen
 */
const EnkeltSak = (props) => {
  const { sakstemaToggleEnabled } = props;
  const { opprettetDato, behandlingOversikter, sakstype, saksstatus, saksnummer, sakstema } = props.sak;

  const { land, behandlingstype, periode, behandlingsstatus, behandlingstema, svarFrist } = behandlingOversikter[0];

  if (sakstemaToggleEnabled) {
    return (
      <div className="enkeltSak">
        <Skjema.CustomRadioPanelElement
          tittel={
            <div className="tittel">
              <span>
                {KV.objektTilTerm(sakstype)} - {KV.objektTilTerm(sakstema)}
              </span>
              <span className="saksnummer">{saksnummer}</span>
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
              description: <Soknadsland land={land} />,
            }, // TODO: visFulltNavn
            {
              description: (
                <div className="behandlingsstatus">
                  <Behandlingsstatuskode behandlingsstatus={behandlingsstatus} />
                  {svarFrist && <span>{`(Svarfrist: ${formatterDatoTilNorsk(svarFrist)})`}</span>}
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
  sakstemaToggleEnabled: PT.bool.isRequired,
};

export default EnkeltSak;
