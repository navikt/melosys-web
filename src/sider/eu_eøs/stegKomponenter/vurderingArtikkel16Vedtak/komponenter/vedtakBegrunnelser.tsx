import MKV from "../../../../../melosyskodeverk";
import Begrunnelser from "../../../../../felleskomponenter/begrunnelser";
import { useSelector } from "react-redux";
import { vilkarSelectors } from "../../../../../ducks/vilkar";

interface VedtakBegrunnelserProps {
  anmodningsperiodeSvarType: string;
}

export function VedtakBegrunnelser({ anmodningsperiodeSvarType }: VedtakBegrunnelserProps) {
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
    <>
      {utsendtArbeidstakerBegrunnelser.length > 0 && (
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for utsending av arbeidstaker"
          valgteBegrunnelser={[...utsendtArbeidstakerBegrunnelser, ...vilkarBegrunnelser]}
          muligeBegrunnelser={[
            ...MKV.KTObjects.begrunnelser.utsendt_arbeidstaker_begrunnelser,
            ...muligeVirksomhetBegrunnelser,
          ]}
        />
      )}
      {utsendtNaeringsdrivendeBegrunnelser.length > 0 && (
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for utsending av næringsdrivende"
          valgteBegrunnelser={[...utsendtNaeringsdrivendeBegrunnelser, ...vilkarBegrunnelser]}
          muligeBegrunnelser={[
            ...MKV.KTObjects.begrunnelser.utsendt_naeringsdrivende_begrunnelser,
            ...muligeVirksomhetBegrunnelser,
          ]}
        />
      )}
      {anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.AVSLAG && (
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for unntak"
          fritekst="Utenlandske trygdemyndigheter har avslått anmodningen om unntak"
        />
      )}
    </>
  );
}

export default VedtakBegrunnelser;
