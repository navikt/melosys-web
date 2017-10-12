import React  from 'react';
import { connect } from 'react-redux';

import './sideDialogDokumenter.css';

const SideDialogDokumenter = function() {
  return (
    <div className="sideDialogDokumenter">
      dokumenter
    </div>
  );
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SideDialogDokumenter);
