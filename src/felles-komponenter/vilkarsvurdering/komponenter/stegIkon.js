import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';

import './stegIkon.css';

const StegIkon = props => (
  <li><button className={classnames('stegIkon', props.erAktiv ? 'stegIkon--aktiv' : '')} onClick={props.onClick} style={{ backgroundImage: `url(${props.ikon})` }} /></li>
);

StegIkon.propTypes = {
  ikon: PT.string,
  erAktiv: PT.bool,
  onClick: PT.func.isRequired,
};

StegIkon.defaultProps = {
  erAktiv: false,
  ikon: '',
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(StegIkon);
