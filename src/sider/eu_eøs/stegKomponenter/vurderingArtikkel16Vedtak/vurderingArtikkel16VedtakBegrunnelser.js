import React, { Fragment } from "react";
import PT from "prop-types";

import MKV from "../../../../melosyskodeverk";
import Begrunnelser from "../../../../felleskomponenter/begrunnelser";

export const VurderingArtikkel16VedtakBegrunnelser = ({
  art12_1_begrunnelser,
  art12_2_begrunnelser,
  vilkarBegrunnelser,
}) => {
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
      <Begrunnelser
        label="Søkeren fyller ikke kriteriene for artikkel 16 nr. 1."
        fritekst="Utenlandske trygdemyndigheter har avslått anmodningen om unntak"
      />
    </Fragment>
  );
};

VurderingArtikkel16VedtakBegrunnelser.propTypes = {
  art12_1_begrunnelser: PT.arrayOf(PT.string).isRequired,
  art12_2_begrunnelser: PT.arrayOf(PT.string).isRequired,
  vilkarBegrunnelser: PT.arrayOf(PT.string).isRequired,
};
