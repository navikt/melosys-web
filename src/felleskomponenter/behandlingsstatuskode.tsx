import React from "react";
import { KTObject } from "@navikt/melosys-kodeverk";
import MKV from "../melosyskodeverk";
import * as MPT from "../proptypes";
import * as Ikoner from "../resources/images";
import * as KV from "../kodeverk";

interface BehandlingsstatuskodeProps {
  behandlingsstatus: KTObject;
}

const getIkon = (status: string) => {
  switch (status) {
    case MKV.Koder.behandlinger.behandlingsstatus.OPPRETTET:
    case MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING:
    case MKV.Koder.behandlinger.behandlingsstatus.SVAR_ANMODNING_MOTTATT:
      return <Ikoner.LockOpenFilled color="#0056B4" />;
    case MKV.Koder.behandlinger.behandlingsstatus.VURDER_DOKUMENT:
      return <Ikoner.LockOpenFilled color="#D47B00" />;
    case MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL:
    case MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART:
    case MKV.Koder.behandlinger.behandlingsstatus.AVVENT_FAGLIG_AVKLARING:
    case MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT:
      return <Ikoner.ClockFilled color="#0056B4" />;
    case MKV.Koder.behandlinger.behandlingsstatus.TIDSFRIST_UTLOEPT:
      return <Ikoner.ClockFilled color="#D47B00" />;
    case MKV.Koder.behandlinger.behandlingsstatus.IVERKSETTER_VEDTAK:
    case MKV.Koder.behandlinger.behandlingsstatus.MIDLERTIDIG_LOVVALGSBESLUTNING:
    case MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET:
      return <Ikoner.LockClosedFilled color="#6A6A6A" />;
    default:
      return null;
  }
};

const Behandlingsstatuskode = ({ behandlingsstatus }: BehandlingsstatuskodeProps) => {
  return (
    <div className="behandlingsstatuskode">
      {getIkon(behandlingsstatus?.kode)}
      <span>{KV.objektTilTerm(behandlingsstatus)}</span>
    </div>
  );
};

Behandlingsstatuskode.defaultProps = {
  behandlingsstatus: null,
};

Behandlingsstatuskode.propTypes = {
  behandlingsstatus: MPT.Kodeverk,
};

export default Behandlingsstatuskode;
