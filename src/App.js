import './App.css';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, Label, ResponsiveContainer } from 'recharts';

function App() {
  const [url, setUrl] = useState('https://api.ratesapi.io/api/latest');
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [chartDate, setChartDate] = useState();
  const [baseCurrency, setBaseCurrency] = useState();


function updateUrl(symbols) {
  if (chartDate && baseCurrency && symbols) {
    setUrl(`https://api.ratesapi.io/api/${chartDate}?base=${baseCurrency}&symbols=${symbols}`);
  } else if (chartDate && baseCurrency) {
    setUrl(`https://api.ratesapi.io/api/${chartDate}?base=${baseCurrency}`);
  } else if (chartDate && symbols) {
    setUrl(`https://api.ratesapi.io/api/${chartDate}?symbols=${symbols}`);
  } else if (chartDate) {
    setUrl(`https://api.ratesapi.io/api/${chartDate}`);
  } else if (baseCurrency && symbols) {
    setUrl(`https://api.ratesapi.io/api/latest?base=${baseCurrency}&symbols=${symbols}`);
  } else if (baseCurrency) {
    setUrl(`https://api.ratesapi.io/api/latest?base=${baseCurrency}`);
  } else if (symbols) {
    setUrl(`https://api.ratesapi.io/api/latest?symbols=${symbols}`);
  }
}

function updateChartDate(date) {
  setChartDate(date);
}

function updateBaseCurrency(newBase) {
  setBaseCurrency(newBase);
}

  useEffect(() => {
    console.log('in effect')
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
    }

    fetchData();
  }, [url]);

  return (
    <div className="App">
      <div id="title">World Currencies and Exchange Rates</div>
      {isLoading ? <p>Loading</p> : <SelectDate {...{updateUrl, updateChartDate}} />}
      {isLoading ? <p>Loading</p> : <ChartDisplayComponent {...{data}} />}
      {isLoading ? <p>Loading</p> : <SelectBaseAndSymbols {...{updateUrl, data, updateBaseCurrency}} />}
    </div>
  );
}

function SelectDate({updateUrl, updateChartDate}) {
  const today = new Date().toISOString().split("T")[0];
  function changeDate() {
    updateChartDate(document.getElementById('date').value);
  }
  function submit() {
    updateUrl();
  }
  return (
    <div id="select-date">
      <label htmlFor="date">Select a date (from January 4th, 1999)</label>
      <input type="date" id="date"
          min="1999-01-04" 
          max={today}
          pattern="\d{4}-\d{2}-\d{2}"
          placeholder="yyyy-mm-dd"
          onChange={() => changeDate()}></input>
      <button type="button" id="update-date-button" onClick={() => submit()} >Submit</button>
    </div>
  );
}

function SelectBaseAndSymbols({updateUrl, data, updateBaseCurrency}) {
  let base, symbols, isEURListed;
  const availableSymbols = data.rates.map(rateObj => {
    if (rateObj.abbreviation === 'EUR') isEURListed = true;
    return rateObj.abbreviation;
  });
  function selectBase() {
    base = document.getElementById('base-currency').value;
    updateBaseCurrency(base);
  }
  function selectSymbols(symbol) {
    symbols
      ? symbols += `,${document.getElementById('checkbox-' + symbol).value}`
      : symbols = document.getElementById('checkbox-' + symbol).value;
  }
  function submit() {
    if (symbols) {
      updateUrl(symbols);
    } else {
      updateUrl();
    }
  }
  console.log(data.rates);
  console.log(data.base);

  return (
    <div id="customize-chart">
      <label htmlFor="base-currency">Select base currency</label>
      <select name="base-currency" id="base-currency" defaultValue={data.base} onChange={() => selectBase()}>
        {!isEURListed
          ? (<option key='EUR' value='EUR' >EUR</option>)
          : null
        }
        {availableSymbols.map(currency => 
          <option key={currency} value={currency} >{currency}</option>
        )}
      </select>
      <div id="checkboxes-label">Narrow down the currencies you're comparing:</div>
      <div id="checkboxes">
        {availableSymbols.map(currency => (
          <div id={currency} className="checkbox-div">
            <input type="checkbox" 
              id={'checkbox-' + currency} 
              key={currency}
              value={currency} 
              name={currency} 
              title={getCurrencyName(currency)} 
              onChange={() => {selectSymbols(currency)}} />
            <label htmlFor={currency}> {currency}</label>
          </div>
        ))}
      </div>
      <button type="button" id="update-url-button" onClick={() => submit()} >Submit</button>
    </div>
  );
}

function CustomizedAxisTick({x, y, stroke, payload}) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} fontSize="10px" textAnchor="end" fill="#666" transform="rotate(-35)">{payload.value}</text>
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
        <p className="rate">{`1 ${payload[0].unit} = ${payload[0].value} ${label}s`}</p>
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
      <ResponsiveContainer class="chart-container" width="95%" height={400} >
        <BarChart margin={{top: 50, bottom: 50, left: 20}} data={rates}>
          <XAxis dataKey="abbreviation" interval={0} minTickGap={20} tick={<CustomizedAxisTick />} >
            <Label value="World Currencies" offset={10} position="bottom" />
          </XAxis>
          <YAxis dataKey="rate" domain={[0.01, 'auto']} scale="log" >
            <Label value="Exchange Rate" angle={-90} position="left" />
          </YAxis>
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="rate" unit={base} >
            {
              rates.map((entry, index) => (
                <Cell key={index} fill={getFillColor(entry.rate)} />
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
