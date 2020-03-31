import React from 'react';
import PT from 'prop-types';

import Element from './element';

const RedigerbarListe = ({
  elementer,
  onFjern,
  onAngreFjern,
  className,
  redigerbar,
}) => (
  <div className={className}>
    {
      elementer.map(({
        kode,
        term,
        fjernbar,
        defaultFjernet,
      }) => (
        <Element
          key={kode}
          kode={kode}
          term={term}
          onFjern={onFjern}
          onAngreFjern={onAngreFjern}
          fjernbar={fjernbar}
          redigerbar={redigerbar}
          defaultFjernet={defaultFjernet}
        />
      ))
    }
  </div>
);

RedigerbarListe.propTypes = {
  elementer: PT.arrayOf(PT.shape({
    kode: PT.string.isRequired,
    term: PT.string.isRequired,
    fjernbar: PT.bool,
    defaultFjernet: PT.bool,
  })).isRequired,
  onFjern: PT.func,
  onAngreFjern: PT.func,
  className: PT.string,
  redigerbar: PT.bool,
};

RedigerbarListe.defaultProps = {
  className: undefined,
  onFjern: () => {},
  onAngreFjern: () => {},
  redigerbar: true,
};

export default RedigerbarListe;
