import * as Utils from '../../utils';

const sorterElementerEtterDato = (order, dateFieldPath) => (forsteElement, andreElement) => {
  const forsteDato = Utils._get(forsteElement, dateFieldPath);
  const andreDato = Utils._get(andreElement, dateFieldPath);

  const datoDiff = Utils.dato.datoDiffPure(forsteDato, andreDato, 'seconds');
  return order === 'descending' ? -datoDiff : datoDiff;
};

export default sorterElementerEtterDato;
