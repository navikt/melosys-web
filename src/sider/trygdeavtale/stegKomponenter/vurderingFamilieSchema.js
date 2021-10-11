import { object } from "yup";

const vurdering_familie = object().shape({
  barn: object().nullable(),
  ektefelle: object().nullable(),
});

export default vurdering_familie;
