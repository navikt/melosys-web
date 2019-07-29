import React from 'react';
import * as PT from 'prop-types';

const SideLoadingStatus = ({ isLoading, error }) => {
  // Handle the loading state
  if (!isLoading) {
    return <div>Laster komponent...</div>;
  } else if (error) {
    // Handle the error state
    return <div>Beklager, kan ikke laste inn side komponenten.</div>;
  }
  return null;
};

SideLoadingStatus.propTypes = {
  isLoading: PT.bool.isRequired,
  error: PT.bool,
};
SideLoadingStatus.defaultProps = {
  error: false,
};

export default SideLoadingStatus;
