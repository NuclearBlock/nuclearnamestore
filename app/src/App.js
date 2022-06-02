import './App.css';
import { Routes, Route, } from "react-router-dom";
import { Container } from '@material-ui/core';

import Home from './pages/Home'
import Account from './pages/Account'

function App() {
  return (
    
    <Container maxWidth="md">
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </Container>
    
  );
}

export default App;
