import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
//import App from './App';
//import App from './LassoSelectionApp'
//import App from './components/CanvasContainer'
import CanvasContainer from "./components/CanvasContainer_be"; // relative path to your component

import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CanvasContainer />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
