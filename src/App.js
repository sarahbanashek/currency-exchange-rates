import './App.css';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, Label, ResponsiveContainer } from 'recharts';
import Dropdown from 'react-bootstrap/Dropdown';

function App() {
  const [url, setUrl] = useState('https://api.ratesapi.io/api/latest');
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);


function selectBase(eventKey) {
  setUrl('https://api.ratesapi.io/api/latest?base=' + eventKey);
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
      {isLoading ? <p>Loading</p> : <SelectBaseAndDate {...{selectBase}} />}
      {isLoading ? <p>Loading</p> : <ChartDisplayComponent {...{data}} />}
    </div>
  );
}

function SelectBaseAndDate({selectBase}) {
  return (
    <div id="select-base-date">
      <Dropdown>
        <Dropdown.Toggle id="dropdown-basic">
          Base Currency
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {Object.keys(currencyNames).map((currency) => (
            <Dropdown.Item as="button" key={currency} onSelect={() => selectBase(currency)} >{currency}</Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  )
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
    return "#023858";
  } else if (rates >= 1000) {
    return "#045a8d";
  } else if (rates >= 500) {
    return "#0570b0";
  } else if (rates >= 100) {
    return "#3690c0";
  } else if (rates >= 50) {
    return "#74a9cf";
  } else if (rates >= 10) {
    return "#a6bddb";
  } else if (rates >= 2) {
    return "#d0d1e6";
  } else if (rates >= 1) {
    return "#ece7f2";
  } else {
    return "#fff7fb";
  }
}

function ChartDisplayComponent({data}) {
  const rates = data.rates;
  const base = data.base;
  const propsDate = data.date.split('-');
  const months = [0, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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
