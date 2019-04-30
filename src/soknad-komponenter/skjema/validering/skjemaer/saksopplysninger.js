import * as Yup from 'yup';

const paneler = {
  foretakUtland: 'Arbeidsgiver i utlandet',
  arbeidUtland: 'Arbeidssted i utlandet',
};

const saksopplysninger = Yup.object().shape({
  foretakUtland: Yup.array().of(Yup.object().shape({
    adresse: Yup.object().shape({
      postnummer: Yup.string().required({ melding: 'Postnummer kreves', panel: paneler.foretakUtland }),
      landkode: Yup.string().required({ melding: 'Land kreves', panel: paneler.foretakUtland }),
      poststed: Yup.string().required({ melding: 'Poststed kreves', panel: paneler.foretakUtland }),
    }),
  })),
  arbeidUtland: Yup.array().of(Yup.object().shape({
    adresse: Yup.object().shape({
      postnummer: Yup.string().required({ melding: 'Postnummer kreves', panel: paneler.arbeidUtland }),
      landkode: Yup.string().required({ melding: 'Land kreves', panel: paneler.arbeidUtland }),
      poststed: Yup.string().required({ melding: 'Poststed kreves', panel: paneler.arbeidUtland }),
    }),
  })),
});

export { saksopplysninger };
