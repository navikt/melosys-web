import * as Yup from "yup";

const sed = Yup.object().shape({
  buc: Yup.string().required("Du må velge BUC"),
  land: Yup.array().of(Yup.string()).min(1, "Du må velge land"),
  mottakerinstitusjoner: Yup.array().of(Yup.string()).min(1, "Du må velge mottakerinstitusjon"),
});

export default sed;
