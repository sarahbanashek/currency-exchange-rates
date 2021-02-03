import './App.css';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, Label, ResponsiveContainer } from 'recharts';
const DEFAULT_CURRENCY = 'EUR';
const DEFAULT_URL = 'https://api.ratesapi.io/api/latest';

function App() {
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
        <ChartDisplayComponent {...{data}} />
        <div id="form-container">
          <SelectDate {...{updateChartDate, isLoading, data}} />
          <SelectBaseAndSymbols {...{updateSymbols, data, baseCurrency, updateBaseCurrency, isLoading, resetUrl}} />
        </div>
      </div>
    );
  }
}

function SelectDate({updateChartDate, isLoading, data}) {
  const today = new Date().toISOString().split("T")[0];
  function changeDate(e) {
    updateChartDate(e.target.value);
  }

  return (
    <div id="select-date">
      <label htmlFor="date">Select a date (from January 4th, 1999)</label>
      {isLoading
        ? <input type="date" id="date"
            value={data.date}
            placeholder="yyyy-mm-dd"
            disabled />
        : <input type="date" id="date"
            value={data.date}
            min="1999-01-04" 
            max={today}
            pattern="\d{4}-\d{2}-\d{2}"
            placeholder="yyyy-mm-dd"
            onChange={(e) => changeDate(e)}/>
            }
    </div>
  );
}

function SelectBaseAndSymbols({updateSymbols, data, baseCurrency, updateBaseCurrency, isLoading, resetUrl}) {
  const [currencies, setCurrencies] = React.useState(new Map(data.rates.map(rateObj => rateObj.abbreviation).map(s => [s, false])));

  useEffect(() => {
    setCurrencies(new Map(data.rates.map(rateObj => rateObj.abbreviation).map(s => [s, false])));
  }, [data.date])
  
  const toggleCurrency = (currencyName) => {
    const isCurrencySelected = currencies.get(currencyName);
    setCurrencies((currentCurrencies) => new Map(currentCurrencies).set(currencyName, !isCurrencySelected));
  }
  
  function selectBase(e) {
    updateBaseCurrency(e.target.value);
  }

  function submit() {
    const symbolsToSubmit = [...currencies.entries()].filter(([_, v]) => v).map(([k, _]) => k);
    const symbolsString = symbolsToSubmit.join(',');
    updateSymbols(symbolsString);
  }

  function resetSelection() {
    setCurrencies(new Map([...currencies.keys()].map(s => [s, false])));
    resetUrl();
  }

  return (
    <div id="customize-chart">
      <label htmlFor="base-currency">Select a base currency</label>
      {isLoading
        ? <select name="base-currency" id="base-currency" value={baseCurrency} disabled>
            <option key={baseCurrency} value={baseCurrency} >{baseCurrency}</option>
          </select>
        : <select name="base-currency" id="base-currency" value={baseCurrency} onChange={(e) => selectBase(e)}>
            <option key={baseCurrency} value={baseCurrency} >{baseCurrency}</option>
            {[...currencies.keys()].map(currency => 
              <option key={currency} value={currency} >{currency}</option>
            )}
          </select>
      }
      <div id="checkboxes-label">Choose which currencies are displayed:</div>
      {isLoading ? "loading" :
      <div id="checkboxes">
        {[...currencies.entries()].map(([currency, isSelected]) => {
          return (
          <button key={currency} title={getCurrencyName(currency)} onClick={() => toggleCurrency(currency)} className={'currency-button' + (isSelected ? ' selected-currency' : '')}>
            <span>{currency}</span>    
          </button>
        )})}
      </div>}
      {isLoading 
        ? (<div id="button-container">
            <button type="button" id="update-url-button" disabled >Submit</button>
            <button type="button" id="reset-url-button" disabled >Reset Chart</button>
          </div>)
        : (<div id="button-container">
            <button type="button" id="update-url-button" onClick={() => submit()} >Submit</button>
            <button type="button" id="reset-url-button" onClick={() => resetSelection()} >Reset Chart</button>
          </div>)
      }
    </div>
  );
}

function CustomizedYAxisTick({x, y, _, payload}) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={5} textAnchor="end" fill="#404040">{Math.round(payload.value * 100000)/100000}</text>
    </g>
  );
}

function CustomizedXAxisTick({x, y, _, payload}) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} fontSize="10px" textAnchor="end" fill="#404040" transform="rotate(-35)">{payload.value}</text>
    </g>
  );
}

function getCurrencyName(label) {
  return currencyNames[label];
}

function CustomTooltip({ active, payload, label }) {
  if (active) {
    return (
      <div className="custom-tooltip">
        <p className="label">{getCurrencyName(label)}</p>
        <p className="rate">{`1 ${payload[0].unit} = ${payload[0].value} ${label}`}</p>
      </div>
    );
  }

  return null;
};

function getFillColor(rates) {
  if (rates >= 10000) {
    return "#057878";
  } else if (rates >= 1000) {
    return "#0f8291";
  } else if (rates >= 500) {
    return "#258bac";
  } else if (rates >= 100) {
    return "#3f97bf";
  } else if (rates >= 50) {
    return "#5aa2ca";
  } else if (rates >= 10) {
    return "#78add2";
  } else if (rates >= 5) {
    return "#96b9d9";
  } else if (rates >= 2) {
    return "#b2c3de";
  } else if (rates >= 1) {
    return "#c8cee4";
  } else {
    return "#dad7e9";
  }
}

function ChartDisplayComponent({data}) {
  const rates = data.rates;
  const base = data.base;
  const propsDate = data.date.split('-');
  const months = {
    '01': 'January',
    '02': 'February',
    '03': 'March',
    '04': 'April',
    '05': 'May',
    '06': 'June',
    '07': 'July',
    '08': 'August',
    '09': 'September',
    '10': 'October',
    '11': 'November',
    '12': 'December'
  }
  const titleDate = `${months[propsDate[1]]} ${propsDate[2]}, ${propsDate[0]}`;

  return (
    <div id="chart" >
      <div id="chart-title">
        Exchange Rates for the {getCurrencyName(base)} on {titleDate}
      </div>
      <ResponsiveContainer className="chart-container" width="95%" height={400} >
        <BarChart margin={{top: 50, bottom: 50, left: 20}} data={rates}>
          <XAxis dataKey="abbreviation" interval={0} minTickGap={20} tick={<CustomizedXAxisTick />} >
            <Label value="World Currencies" offset={20} position="bottom" fill="#404040" />
          </XAxis>
          <YAxis dataKey="rate" domain={[0.01, 'auto']} scale="log" tick={<CustomizedYAxisTick />} >
            <Label value="Exchange Rate" angle={-90} offset={15} position="left" fill="#404040" />
          </YAxis>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#EFEFEF' }} />
          <Bar dataKey="rate" unit={base} >
            {
              rates.map((entry, index) => (
                <Cell className="bar" key={index} fill={getFillColor(entry.rate)} />
              ))
            }
          </Bar>
        </BarChart>
      </ResponsiveContainer>
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
  CYP: 'Cypriot Pound',
  DKK: 'Danish Krone',
  EEK: 'Estonian Kroon',
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
  LTL: 'Lithuanian Litas',
  LVL: 'Latvian Lats',
  MTL: 'Maltese Lira',
  MXN: 'Mexican Peso',
  MYR: 'Malaysian Ringgit',
  NOK: 'Norwegian Krone',
  NZD: 'New Zealand Dollar',
  PHP: 'Philippine Peso',
  PLN: 'Polish Zloty',
  ROL: 'Romanian Leu',
  RON: 'Romanian Leu',
  RUB: 'Russian Rouble',
  SEK: 'Swedish Krona',
  SGD: 'Singapore Dollar',
  SIT: 'Slovenian Tolar',
  SKK: 'Slovak Koruna',
  THB: 'Thai  Baht',
  TRL: 'Turkish Lira',
  TRY: 'Turkish Lira',
  USD: 'US Dollar',
  ZAR: 'South African Rand'
}

export default App;