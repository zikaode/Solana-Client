import { createContext, useContext, createSignal } from "solid-js";

const GlobalContext = createContext();

export function GlobalProvider(props) {
  const [globalState, setGlobalState] = createSignal({
    clienturl: "https://solana-client.vercel.app",
    serverurl: "https://evoting-server.vercel.app",
    user: null,
    theme: "dark",
    loading: true,
    route: null,
    function: null,
    selectedElection: "",
    wallet: null,
    smartContractProgram: null,
    suratSuara: null,
  });

  return (
    <GlobalContext.Provider value={[globalState, setGlobalState]}>
      {props.children}
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  return useContext(GlobalContext);
}
