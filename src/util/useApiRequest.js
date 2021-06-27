import { useEffect, useState } from "react";
import axios from "axios";

export const useApiRequest = (url) => {
  const [data, setData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = () => {
    axios
      .get(url)
      .then((response) => {
        setIsLoaded(true);
        setData(response.data);
      })
      .catch((error) => {
        setError(error);
      });
  };

  useEffect(() => {
    //Init fetching
    fetchData();
    //Fetching every described second
    const interval = setInterval(() => {
      fetchData();
    }, 20000);
    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { error, isLoaded, data };
};
