import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './print.css'
import { registerHeartbeat } from './sync/heartbeat'

// Register background services
registerHeartbeat(); // Keeps Supabase free-tier project alive (daily ping)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
