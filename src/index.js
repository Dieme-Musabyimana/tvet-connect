import React from "react";
import './style.css';
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css"; 
import "./App.css";

// Track mouse to update CSS vars for interactive background
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', (e) => {
    const x = Math.round((e.clientX / window.innerWidth) * 100);
    const y = Math.round((e.clientY / window.innerHeight) * 100);
    document.documentElement.style.setProperty('--mx', x + '%');
    document.documentElement.style.setProperty('--my', y + '%');
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);