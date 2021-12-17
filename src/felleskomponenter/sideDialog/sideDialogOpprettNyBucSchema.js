import * as Yup from "yup";

const sed = Yup.object().shape({
  buc: Yup.string().required("BUC kreves"),
  land: Yup.array().of(Yup.string()).required("Land kreves"),
  mottakerinstitusjoner: Yup.array().of(Yup.string()).required("Mottakerinstitusjon kreves"),
});

export default sed;
