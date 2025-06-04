import * as Utils from "../../utils";
import dayjs from "dayjs";

const sorterElementerEtterDato = (order, dateFieldPath) => (forsteElement, andreElement) => {
  const forsteDato = dayjs(Utils._get(forsteElement, dateFieldPath));
  const andreDato = dayjs(Utils._get(andreElement, dateFieldPath));

  const diff = forsteDato.diff(andreDato);
  return order === "descending" ? -diff : diff;
};

export default sorterElementerEtterDato;
