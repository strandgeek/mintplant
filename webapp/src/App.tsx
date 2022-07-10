import { Topbar } from "./components/Topbar";
import { Web3Provider } from "./providers/web3";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Pages
import { Home } from "./pages/Home";
import { Mint } from "./pages/Mint";
import { MyTokens } from "./pages/MyTokens";

function App() {
  return (
    <BrowserRouter>
      <Web3Provider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mint" element={<Mint />} />
          <Route path="/my-tokens" element={<MyTokens />} />
        </Routes>
      </Web3Provider>
    </BrowserRouter>
  );
}

export default App;
