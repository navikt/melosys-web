import React from 'react';
import PT from 'prop-types';
import classnames from 'classnames';

import './stegIkon.css';

const StegIkon = props => {
  const className = classnames('stegIkon', !props.tilgjengelig ? 'stegIkon--utilgjengelig' : '');

  return (
    <li>
      <button
        className={className}
        onClick={props.onClick}
        style={{ backgroundImage: `url(${props.ikon})` }}
        aria-disabled={!props.tilgjengelig}
      />
    </li>
  );
};

StegIkon.propTypes = {
  ikon: PT.string,
  tilgjengelig: PT.bool,
  onClick: PT.func.isRequired,
};

StegIkon.defaultProps = {
  tilgjengelig: true,
  ikon: '',
};

export default StegIkon;
