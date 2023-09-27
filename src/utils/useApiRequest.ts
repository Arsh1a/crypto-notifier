import { useEffect, useState } from "react";
import axios from "axios";

const useApiRequest = (...urls: string[]) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = () => {
    // If there are multiple URLs
    if (urls.length > 1) {
      const requests = urls.map((url) => axios.get(url));

      axios
        .all(requests)
        .then(
          axios.spread((...responses) => {
            setIsLoaded(true);
            const combinedData = Object.assign(
              {},
              ...responses.map((response) => response.data)
            );
            console.log(combinedData);
            setData(combinedData);
          })
        )
        .catch((err) => {
          setError(err);
        });
    } else if (urls.length === 1) {
      // If there's just one URL
      axios
        .get(urls[0])
        .then((response) => {
          setIsLoaded(true);
          setData([response.data]);
        })
        .catch((err) => {
          setError(err);
        });
    }
  };

  useEffect(() => {
    // Init fetching
    fetchData();
    // Fetching every described second
    const interval = setInterval(() => {
      fetchData();
    }, 20000);

    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, urls);

  return { error, isLoaded, data };
};

export default useApiRequest;
