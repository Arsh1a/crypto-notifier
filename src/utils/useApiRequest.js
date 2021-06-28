import { useEffect, useState } from "react";
import axios from "axios";

const useApiRequest = (url, secondUrl) => {
  const [data, setData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = () => {
    if (secondUrl) {
      axios
        .all([axios.get(url), axios.get(secondUrl)])
        .then(
          axios.spread((obj1, obj2) => {
            setIsLoaded(true);
            setData({ ...obj1.data, ...obj2.data });
          })
        )
        .catch((error) => {
          setError(error);
        });
    } else {
      axios
        .get(url)
        .then((response) => {
          setIsLoaded(true);
          setData(response.data);
        })
        .catch((error) => {
          setError(error);
        });
    }
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
  }, [url, secondUrl]);

  return { error, isLoaded, data };
};

export default useApiRequest;