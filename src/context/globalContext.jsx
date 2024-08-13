import { createContext, useContext, createSignal } from "solid-js";

const GlobalContext = createContext();

export function GlobalProvider(props) {
  const [globalState, setGlobalState] = createSignal({
    clienturl: "http://localhost:5173",
    serverurl: "https://evoting-server.vercel.app",
    user: null,
    theme: "light",
    loading: true,
    route: null,
    function: null,
    selectedElection: "",
    wallet: null,
    smartContractProgram: null,
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
