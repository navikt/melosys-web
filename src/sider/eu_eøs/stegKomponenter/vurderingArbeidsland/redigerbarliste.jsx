import PT from "prop-types";

import Element from "./element";

function Redigerbarliste({ elementer, onFjern, onAngreFjern, className, redigerbar }) {
  return (
    <div className={className}>
      {elementer.map(({ kode, term, fjernbar, defaultFjernet }) => (
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
      ))}
    </div>
  );
}

Redigerbarliste.propTypes = {
  elementer: PT.arrayOf(
    PT.shape({
      kode: PT.string.isRequired,
      term: PT.string.isRequired,
      fjernbar: PT.bool,
      defaultFjernet: PT.bool,
    }),
  ).isRequired,
  onFjern: PT.func,
  onAngreFjern: PT.func,
  className: PT.string,
  redigerbar: PT.bool,
};

Redigerbarliste.defaultProps = {
  className: undefined,
  onFjern: () => {},
  onAngreFjern: () => {},
  redigerbar: true,
};

export default Redigerbarliste;
