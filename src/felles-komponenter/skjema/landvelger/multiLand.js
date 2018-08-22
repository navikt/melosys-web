import React, { Component } from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';
import { connect } from 'react-redux';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';

import './landvelger.css';


const MultiLand = ({
  label, feil, fokusUtHandler, fokusInnHandler, inputEndringHandler, inputTastNedHandler, inputVerdi,
}) => {

  return (
    <div>

    </div>
  )
};

MultiLand.propTypes = {

};

MultiLand.defaultProps = {

};

export default MultiLand;
