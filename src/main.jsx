import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error(
    "[DOM Mount Failure]: Fatal initialization error. Main container element '#root' was not resolved in the target index document."
  );
}
const root = createRoot(container);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);