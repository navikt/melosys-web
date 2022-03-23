import React from "react";
import PT from "prop-types";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as Nav from "../../navFrontend";
import * as MPT from "../../proptypes";
import * as Api from "../../services/api";

import Oppsummering from "./oppsummering";

import "./sideOppsummering.css";

interface SideOppsummeringProps {
  oppsummering: Api.Behandlinger.behandling.Oppsummering;
  arbeidsland: KTObject[];
  fagsak: Api.Fagsak;
  lovvalgsperiodeFom: string;
  lovvalgsperiodeTom: string;
  lovvalgsland: KTObject;
  behandlingsgrunnlagPeriodeFom: string;
  behandlingsgrunnlagPeriodeTom: string;
  behandlingsgrunnlagMottaksdato: string;
}

const SideOppsummering = ({
  oppsummering,
  fagsak,
  arbeidsland,
  lovvalgsland,
  lovvalgsperiodeFom,
  lovvalgsperiodeTom,
  behandlingsgrunnlagPeriodeFom,
  behandlingsgrunnlagPeriodeTom,
  behandlingsgrunnlagMottaksdato,
}: SideOppsummeringProps) => {
  if (!oppsummering) return <div />;

  return (
    <section aria-label="oppsummeringer" className="sideOppsummering panelSeksjon">
      <Nav.Panel className="saksbehandling__soknadSammendrag">
        <Nav.Row>
          <Nav.Column xs="12">
            <Oppsummering
              oppsummering={oppsummering}
              fagsak={fagsak}
              arbeidsland={arbeidsland}
              lovvalgsland={lovvalgsland}
              lovvalgsperiode={`${lovvalgsperiodeFom} - ${lovvalgsperiodeTom}`}
              behandlingsgrunnlagperiode={`${behandlingsgrunnlagPeriodeFom} - ${behandlingsgrunnlagPeriodeTom}`}
              mottattDato={behandlingsgrunnlagMottaksdato}
            />
          </Nav.Column>
        </Nav.Row>
      </Nav.Panel>
    </section>
  );
};

SideOppsummering.propTypes = {
  fagsak: MPT.Fagsak,
  oppsummering: MPT.Behandlinger.Oppsummering,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
  lovvalgsland: MPT.Kodeverk,
  arbeidsland: PT.arrayOf(MPT.Kodeverk),
  behandlingsgrunnlagPeriodeFom: PT.string,
  behandlingsgrunnlagPeriodeTom: PT.string,
  behandlingsgrunnlagMottaksdato: PT.string,
};

SideOppsummering.defaultProps = {
  lovvalgsland: {},
  arbeidsland: [],
  fagsak: undefined,
  oppsummering: undefined,
  lovvalgsperiodeFom: undefined,
  lovvalgsperiodeTom: undefined,
  behandlingsgrunnlagPeriodeFom: undefined,
  behandlingsgrunnlagPeriodeTom: undefined,
  behandlingsgrunnlagMottaksdato: undefined,
};

export default SideOppsummering;
