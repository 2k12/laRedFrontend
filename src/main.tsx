import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { FilterProvider } from './context/FilterContext'
import { LocationProvider } from './context/LocationContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FilterProvider>
      <LocationProvider>
        <App />
      </LocationProvider>
    </FilterProvider>
  </StrictMode>,
)
