import React from 'react';
import PT from 'prop-types';
import classNames from 'classnames';

import * as Nav from '../../utils/navFrontend';

import './undertittel.css';

const Undertittel = ({
  ikon: Ikon,
  tekst,
  className,
  understrek,
}) => {
  const cl = classNames('undertittel', className);
  const navUndertittelCl = classNames({ understrek }, 'navUndertittel');

  return (
    <div className={cl}>
      <Nav.typo.Undertittel className={navUndertittelCl}>
        {
          Ikon &&
          <Ikon className="ikon" />
        }
        <span>
          {tekst}
        </span>
      </Nav.typo.Undertittel>
    </div>
  );
};

Undertittel.propTypes = {
  ikon: PT.elementType.isRequired,
  tekst: PT.string.isRequired,
  className: PT.string,
  understrek: PT.bool,
};

Undertittel.defaultProps = {
  className: undefined,
  understrek: false,
};

export default Undertittel;
