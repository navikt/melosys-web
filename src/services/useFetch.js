import { useState, useEffect } from 'react';
/* eslint-disable no-console */
const useFetch = (url, dependencies) => {
  const [isLoading, setLoadState] = useState(false);
  const [fetchedData, setFetchedData] = useState(null);
  useEffect(() => {
    setLoadState(true);
    // fetch('http://localhost:3002/api/personer/?fnr=17117802280')
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        return response.json();
      })
      .then(data => {
        setLoadState(false);
        setFetchedData({ ...fetchedData, data });
      })
      .catch(err => {
        setLoadState(false);
        console.dir(err);
      });
  }, dependencies);
  console.dir(fetchedData);
  return [isLoading, fetchedData];
};
export default useFetch;
