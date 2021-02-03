import React, { useEffect } from 'react';
import { getCurrencyName } from "../utilities/getCurrencyName";

export function SelectBaseAndSymbols({updateSymbols, data, baseCurrency, updateBaseCurrency, isLoading, resetUrl}) {
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