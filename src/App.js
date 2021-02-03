import './App.css';
import React, { useState, useEffect } from 'react';
import { ChartDisplay } from './components/ChartDisplay';
import { SelectDate } from './components/SelectDate';
import { SelectBaseAndSymbols } from './components/SelectBaseAndSymbols';
const DEFAULT_CURRENCY = 'EUR';
const DEFAULT_URL = 'https://api.ratesapi.io/api/latest';

export function App() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [data, setData] = useState({});
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chartDate, setChartDate] = useState();
  const [baseCurrency, setBaseCurrency] = useState(DEFAULT_CURRENCY);
  const [symbols, setSymbols] = useState();

  function updateSymbols(symbolsString) {
    setSymbols(symbolsString);
    chartDate
      ? setUrl(`https://api.ratesapi.io/api/${chartDate}?base=${baseCurrency}&symbols=${symbolsString}`)
      : setUrl(`https://api.ratesapi.io/api/latest?base=${baseCurrency}&symbols=${symbolsString}`)
  }

  function updateChartDate(date) {
    setChartDate(date);
    setUrl(`https://api.ratesapi.io/api/${date}`);
    setBaseCurrency(DEFAULT_CURRENCY);
    setSymbols(null);
  }

  function updateBaseCurrency(newBase) {
    setBaseCurrency(newBase);

    if (chartDate && symbols) {
      setUrl(`https://api.ratesapi.io/api/${chartDate}?base=${newBase}&symbols=${symbols}`);
    } else if (chartDate) {
      setUrl(`https://api.ratesapi.io/api/${chartDate}?base=${newBase}`);
    } else if (symbols) {
      setUrl(`https://api.ratesapi.io/api/latest?base=${newBase}&symbols=${symbols}`);
    } else {
      setUrl(`https://api.ratesapi.io/api/latest?base=${newBase}`);
    }
  }

  function resetUrl() {
    setUrl('https://api.ratesapi.io/api/latest');
    setBaseCurrency(DEFAULT_CURRENCY);
    setChartDate(null);
    setSymbols(null);
  }

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const response = await fetch(url);
      const json = await response.json();

      const rates = Object.entries(json.rates).map(kv => {
        return {abbreviation: kv[0], rate: kv[1]};
      }).sort((a, b) => a.abbreviation < b.abbreviation ? -1 : 1);

      const newData = {
        base: json.base,
        date: json.date,
        rates
      }

      setData(newData);
      setIsLoading(false);
      if (!hasLoadedInitialData) setHasLoadedInitialData(true);
    }

    fetchData();
  }, [url, hasLoadedInitialData]);

  if (!hasLoadedInitialData) {
    return <div>Loading...</div>
  } else {
    return (
      <div className="App">
        <div id="title">World Currencies and Exchange Rates</div>
        <ChartDisplay {...{data}} />
        <div id="form-container">
          <SelectDate {...{updateChartDate, isLoading, data}} />
          <SelectBaseAndSymbols {...{updateSymbols, data, baseCurrency, updateBaseCurrency, isLoading, resetUrl}} />
        </div>
      </div>
    );
  }
}