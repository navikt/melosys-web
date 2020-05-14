import * as Utils from '../../utils';

const sorterElementerEtterDato = (order, dateFieldPath) => (forsteOppgave, andreOppgave) => {
  const forsteDato = Utils._get(forsteOppgave, dateFieldPath);
  const andreDato = Utils._get(andreOppgave, dateFieldPath);

  const datoDiff = Utils.dato.datoDiffPure(forsteDato, andreDato, 'seconds');
  return order === 'descending' ? -datoDiff : datoDiff;
};

export default sorterElementerEtterDato;
