import { kodeset } from 'melosys-kodeverk';

const { behandlinger } = kodeset;

export default {
  FASTSATT_LOVVALGSLAND: behandlinger.resultattyper.FASTSATT_LOVVALGSLAND,
  FORELOEPIG_FASTSATT_LOVVALGSLAND: behandlinger.resultattyper.FORELOEPIG_FASTSATT_LOVVALGSLAND,
  HENLEGGELSE: behandlinger.resultattyper.HENLEGGELSE,
  ANMODNING_OM_UNNTAK: behandlinger.resultattyper.ANMODNING_OM_UNNTAK,
  SOEKNAD: behandlinger.typer.SOEKNAD,
  ENDRET_PERIODE: behandlinger.typer.ENDRET_PERIODE,
  VURDER_DOKUMENT: behandlinger.status.VURDER_DOKUMENT,
  AVVENT_DOK_UTL: behandlinger.status.AVVENT_DOK_UTL,
  AVVENT_DOK_PART: behandlinger.status.AVVENT_DOK_PART,
  UNDER_BEHANDLING: behandlinger.status.UNDER_BEHANDLING,
};
