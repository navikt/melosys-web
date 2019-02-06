import { kodeset } from 'melosys-kodeverk';

const { behandlinger } = kodeset;

export default {
  ANMODNING_OM_UNNTAK: behandlinger.resultattyper.ANMODNING_OM_UNNTAK,
  FASTSATT_LOVVALGSLAND: behandlinger.resultattyper.FASTSATT_LOVVALGSLAND,
  FORELOEPIG_FASTSATT_LOVVALGSLAND: behandlinger.resultattyper.FORELOEPIG_FASTSATT_LOVVALGSLAND,
  HENLEGGELSE: behandlinger.resultattyper.HENLEGGELSE,
  SOEKNAD: behandlinger.typer.SOEKNAD,
  ENDRET_PERIODE: behandlinger.typer.ENDRET_PERIODE,
  AVSLUTTET: behandlinger.status.AVSLUTTET,
  AVVENT_DOK_UTL: behandlinger.status.AVVENT_DOK_UTL,
  AVVENT_DOK_PART: behandlinger.status.AVVENT_DOK_PART,
  UNDER_BEHANDLING: behandlinger.status.UNDER_BEHANDLING,
  VURDER_DOKUMENT: behandlinger.status.VURDER_DOKUMENT,
};
