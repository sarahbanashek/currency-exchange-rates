import './App.css';
import React, { useState, useEffect } from 'react';
import { Chart } from "react-google-charts";


function App() {
  const [url, setUrl] = useState('https://api.ratesapi.io/api/latest');
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const response = await fetch(url);
      const json = await response.json();

      const rates = Object.entries(json.rates).map(kv => {
        return [kv[0], kv[1], currencyNames[kv[0]]]
      })

      const newData = {
        base: json.base,
        rates
      }

      setData(newData);
      setIsLoading(false);
    }
    fetchData();
  }, [url]);

  console.log(data.rates);

  return (
    <div className="App">
      {isLoading ? <p>Loading</p> : <div id="base-currency">{data.base}</div>}
      <div id="rates">
        {data.rates}
      </div>
    </div>
  );
}



const currencyNames = {
  AUD: 'Australian Dollar',
  BGN: 'Bulgarian Lev',
  BRL: 'Brazilian Real',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan Renminbi',
  CZK: 'Czech Koruna',
  DKK: 'Danish Krone',
  EUR: 'EU Euro',
  GBP: 'Great British Pound Sterling',
  HKD: 'Hong Kong Dollar',
  HRK: 'Croatian Kuna',
  HUF: 'Hungarian Forint',
  IDR: 'Indonesian Rupiah',
  ILS: 'Israeli Shekel',
  INR: 'Indian Rupee',
  ISK: 'Icelandic Krona',
  JPY: 'Japanese Yen',
  KRW: 'South Korean Won',
  MXN: 'Mexican Peso',
  MYR: 'Malaysian Ringgit',
  NOK: 'Norwegian Krone',
  NZD: 'New Zealand Dollar',
  PHP: 'Philippine Peso',
  PLN: 'Polish Zloty',
  RON: 'Romanian Leu',
  RUB: 'Russian Rouble',
  SEK: 'Swedish Krona',
  SGD: 'Singapore Dollar',
  THB: 'Thai  Baht',
  TRY: 'Turkish Lira',
  USD: 'US Dollar',
  ZAR: 'South African Rand'
}

export default App;
