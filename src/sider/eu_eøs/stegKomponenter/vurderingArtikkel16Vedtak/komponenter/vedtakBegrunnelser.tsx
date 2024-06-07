import MKV from "../../../../../melosyskodeverk";
import { Fragment } from "react";
import Begrunnelser from "../../../../../felleskomponenter/begrunnelser";
import { KTObject } from "@navikt/melosys-kodeverk";
import { useFeatureToggle } from "../../../../../featuretoggle";
import { MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA } from "../../../../../featuretoggle/toggleNavn";

interface VedtakBegrunnelserProps {
  art12_1_begrunnelser: KTObject[];
  art12_2_begrunnelser: KTObject[];
  vilkarBegrunnelser: KTObject[];
  anmodningsperiodeSvarType: string;
}

export const VedtakBegrunnelser = ({
  art12_1_begrunnelser,
  art12_2_begrunnelser,
  vilkarBegrunnelser,
  anmodningsperiodeSvarType,
}: VedtakBegrunnelserProps) => {
  const konvensjonStorbritanniaToggleEnabled = useFeatureToggle(MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA);

  const muligeVirksomhetBegrunnelser = [
    ...MKV.KTObjects.begrunnelser.art12_2_normalt_virksomhet,
    ...MKV.KTObjects.begrunnelser.art12_1_vesentlig_virksomhet,
    ...MKV.KTObjects.begrunnelser.art12_1_forutgaaende_medl,
    ...MKV.KTObjects.begrunnelser.bosted,
  ];

  return (
    <Fragment>
      {art12_1_begrunnelser.length > 0 && (
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for artikkel 12 nr. 1."
          valgteBegrunnelser={[...art12_1_begrunnelser, ...vilkarBegrunnelser]}
          muligeBegrunnelser={[...MKV.KTObjects.begrunnelser.art12_1_begrunnelser, ...muligeVirksomhetBegrunnelser]}
        />
      )}
      {art12_2_begrunnelser.length > 0 && (
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for artikkel 12 nr. 2."
          valgteBegrunnelser={[...art12_2_begrunnelser, ...vilkarBegrunnelser]}
          muligeBegrunnelser={[...MKV.KTObjects.begrunnelser.art12_2_begrunnelser, ...muligeVirksomhetBegrunnelser]}
        />
      )}
      {!konvensjonStorbritanniaToggleEnabled ||
        (anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.AVSLAG && (
          <Begrunnelser
            label={
              konvensjonStorbritanniaToggleEnabled
                ? "Søkeren fyller ikke kriteriene for unntak"
                : "Søkeren fyller ikke kriteriene for artikkel 16 nr. 1."
            }
            fritekst="Utenlandske trygdemyndigheter har avslått anmodningen om unntak"
          />
        ))}
    </Fragment>
  );
};

export default VedtakBegrunnelser;
