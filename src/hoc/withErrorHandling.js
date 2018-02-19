import React from 'react';

const withErrorHandling = WrappedComponent => props => {
  const { children } = props;
  console.log(props);
  return (
    <WrappedComponent>
      <div className="error-message">Feilmelding her</div>
      {children}
    </WrappedComponent>
  );
};

export default withErrorHandling;
