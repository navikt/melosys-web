import MKV from "../../../../../melosyskodeverk";
import { Fragment } from "react";
import Begrunnelser from "../../../../../felleskomponenter/begrunnelser";
import { useFeatureToggle } from "../../../../../featuretoggle";
import { MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA } from "../../../../../featuretoggle/toggleNavn";
import { useSelector } from "react-redux";
import { vilkarSelectors } from "../../../../../ducks/vilkar";

interface VedtakBegrunnelserProps {
  anmodningsperiodeSvarType: string;
}

export const VedtakBegrunnelser = ({ anmodningsperiodeSvarType }: VedtakBegrunnelserProps) => {
  const konvensjonStorbritanniaToggleEnabled = useFeatureToggle(MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA);
  const vilkarBegrunnelser = useSelector(vilkarSelectors.VilkarBegrunnelserSelector);
  const utsendtArbeidstakerBegrunnelser = useSelector(vilkarSelectors.UtsendingsvilkårArbeidstakerBegrunnelserSelector);
  const utsendtNaeringsdrivendeBegrunnelser = useSelector(
    vilkarSelectors.UtsendingsvilkårNæringsdrivendeBegrunnelserSelector,
  );

  const muligeVirksomhetBegrunnelser = [
    ...MKV.KTObjects.begrunnelser.normalt_virksomhet_begrunnelser,
    ...MKV.KTObjects.begrunnelser.vesentlig_virksomhet_begrunnelser,
    ...MKV.KTObjects.begrunnelser.forutgaaende_medl_begrunnelser,
    ...MKV.KTObjects.begrunnelser.bosted,
  ];

  return (
    <Fragment>
      {utsendtArbeidstakerBegrunnelser.length > 0 && (
        <Begrunnelser
          label={
            konvensjonStorbritanniaToggleEnabled
              ? "Søkeren fyller ikke kriteriene for utsending av arbeidstaker"
              : "Søkeren fyller ikke kriteriene for artikkel 12 nr. 1."
          }
          valgteBegrunnelser={[...utsendtArbeidstakerBegrunnelser, ...vilkarBegrunnelser]}
          muligeBegrunnelser={[
            ...MKV.KTObjects.begrunnelser.utsendt_arbeidstaker_begrunnelser,
            ...muligeVirksomhetBegrunnelser,
          ]}
        />
      )}
      {utsendtNaeringsdrivendeBegrunnelser.length > 0 && (
        <Begrunnelser
          label={
            konvensjonStorbritanniaToggleEnabled
              ? "Søkeren fyller ikke kriteriene for utsending av næringsdrivende"
              : "Søkeren fyller ikke kriteriene for artikkel 12 nr. 2."
          }
          valgteBegrunnelser={[...utsendtNaeringsdrivendeBegrunnelser, ...vilkarBegrunnelser]}
          muligeBegrunnelser={[
            ...MKV.KTObjects.begrunnelser.utsendt_naeringsdrivende_begrunnelser,
            ...muligeVirksomhetBegrunnelser,
          ]}
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
