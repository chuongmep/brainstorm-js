import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import dotenv from 'dotenv';

dotenv.config({
    path: '../.env.local',
    override: true
});
var APS_ACCESS_TOKEN = process.env.APS_ACCESS_TOKEN;
var APS_MODEL_URN = process.env.APS_MODEL_URN;
console.log(APS_ACCESS_TOKEN);
const root = ReactDOM.createRoot(document.getElementById('root'));
if (!APS_ACCESS_TOKEN || !APS_MODEL_URN) {
    root.render(<div>Please specify <code>APS_ACCESS_TOKEN</code> and <code>APS_MODEL_URN</code> in the source code.</div>);
} else {
    root.render(<App token={APS_ACCESS_TOKEN} urn={APS_MODEL_URN} />);
}
