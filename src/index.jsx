import { render } from "solid-js/web";
import { GlobalProvider } from "./context/globalContext";
import App from "./app";
import "./index.css";
render(
  () => (
    <GlobalProvider>
      {/* <WalletConnection /> */}
      <App />
      {/* <smartcontractTest /> */}
    </GlobalProvider>
  ),
  document.getElementById("root")
);
