import React, { useState, useEffect } from "react";

import "./App.css";

const formatNumber = (number) => new Intl.NumberFormat("en", { minimumFractionDigits: 2 }).format(number);

const App = () => {
  const [prices, setPrices] = useState({});           //keys: product names, values: revenue
  const [filter, setFilter] = useState('');           //search input value
  const [allKeys, setAllKeys] = useState([]);         //All product names, sorted
  const [isLoading, setIsLoading] = useState(true);   //Flag for loading
  const [visibleKeys, setVisibleKeys] = useState([]); //Product names to be shown in table

  useEffect(() => {
    const branch1 = fetch("api/branch1.json").then((res) => res.json());  //branch1 products
    const branch2 = fetch("api/branch2.json").then((res) => res.json());  //branch2 products
    const branch3 = fetch("api/branch3.json").then((res) => res.json());  //branch3 products
    
    //.allSettled instead of .all so that as much data is retrieved as possible
    Promise
      .allSettled([branch1, branch2, branch3])
      .then((values) => {
        const list = {};
        const newValues = values
          .filter(res => res.status === 'fulfilled')
          .map(res => res.value.products)
          .flat();
        
        newValues.forEach(el => {
          const rev = el.unitPrice * el.sold;
          list[el.name] = list[el.name] ? list[el.name] + rev : rev;
        });

        setAllKeys(Object.keys(list).sort());
        setPrices(list);
      })
      .catch(err => console.log(err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setVisibleKeys(filter 
      ? allKeys.filter(key => key.match(new RegExp(filter, "gi")))
      : allKeys);

    //Changing Page Title to show search input
    document.title = filter
      ? "Searching Products for: " + filter
      : "Wowcher Technical Test - React FE Devs";
  }, [filter, allKeys]);

  const getRevenue = (keys) => formatNumber(keys.reduce((acc, cur) => acc + prices[cur], 0));

  const renderRows = () => {
    return visibleKeys.length > 0
      ? (visibleKeys.map(key => (
          <tr key={key}>
            <td>{key}</td>
            <td>{formatNumber(prices[key])}</td>
          </tr>
        )))
      : (
          <tr>
            <td>No Applicable Products</td>
            <td>--</td>
          </tr>
        );
  }

  const renderContent = () => {
    return (
      <>
        <div
          role="search"
          className="search"
        >
          <label id="search-label">Search Products</label>
          <input 
            role="searchbox"
            type="text" 
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Search input for products"
          />
        </div>
        
        <table 
          role="table"
          aria-label="List of Products and their generated revenues"
        >
          <thead>
            <tr>
              <th>Product</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {renderRows()}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td>{getRevenue(visibleKeys)}</td>
            </tr>
          </tfoot>
        </table>
      </>
    );
  }

  return (
    <div className="product-list">
      {
        (isLoading 
          ? <p className="loading-text">Loading...</p>
          : renderContent()
        )
      }
    </div>
  );
};

export default App;
