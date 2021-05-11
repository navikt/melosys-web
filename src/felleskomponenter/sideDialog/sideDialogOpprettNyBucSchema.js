import * as Yup from "yup";

const sed = Yup.object().shape({
  buc: Yup.string().required({ feilmelding: "BUC kreves" }),
  land: Yup.array().of(Yup.string()).required({ feilmelding: "Land kreves" }),
  mottakerinstitusjoner: Yup.array().of(Yup.string()).required({ feilmelding: "Mottakerinstitusjon kreves" }),
});

export default sed;
