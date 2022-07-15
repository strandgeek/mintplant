import { Topbar } from "./components/Topbar";
import { Web3Provider } from "./providers/web3";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Pages
import { Home } from "./pages/Home";
import { Mint } from "./pages/Mint";

function App() {
  return (
    <BrowserRouter>
      <Web3Provider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mint" element={<Mint />} />
        </Routes>
      </Web3Provider>
    </BrowserRouter>
  );
}

export default App;
