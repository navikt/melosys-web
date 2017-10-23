import React from 'react';
import PT from 'prop-types';
import classnames from 'classnames';

import './stegIkon.css';

function StegIkon(props) {
  return (
    <li>
      <button className={classnames('stegIkon', props.erAktiv ? 'stegIkon--aktiv' : '')} onClick={props.onClick} style={{ backgroundImage: `url(${props.ikon})` }} />
    </li>
  );
}

StegIkon.propTypes = {
  ikon: PT.string,
  erAktiv: PT.bool,
  onClick: PT.func.isRequired,
};

StegIkon.defaultProps = {
  erAktiv: false,
  ikon: '',
};

export default StegIkon;
