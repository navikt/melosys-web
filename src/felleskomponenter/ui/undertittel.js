import React from 'react';
import PT from 'prop-types';
import classNames from 'classnames';

import * as Nav from '../../utils/navFrontend';

import './undertittel.css';

const Undertittel = ({
  ikon,
  tekst,
  className,
  understrek,
}) => {
  const cl = classNames('undertittel', className);
  const navUndertittelCl = classNames({ understrek });

  return (
    <div className={cl}>
      <Nav.typo.Undertittel className={navUndertittelCl}>
        {
          ikon &&
          <img src={ikon} height={25} alt={tekst} />
        }
        {tekst}
      </Nav.typo.Undertittel>
    </div>
  );
};

Undertittel.propTypes = {
  ikon: PT.any.isRequired,
  tekst: PT.string.isRequired,
  className: PT.string,
  understrek: PT.bool,
};

Undertittel.defaultProps = {
  className: undefined,
  understrek: false,
};

export default Undertittel;
