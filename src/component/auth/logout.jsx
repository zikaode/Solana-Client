import { useGlobalContext } from "../../context/globalContext";
import { useNavigate } from "@solidjs/router";
import { onMount } from "solid-js";

const Logout = () => {
  const [globalState, setGlobalState] = useGlobalContext();
  const navigate = useNavigate();
  onMount(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("autoConnect");
    setGlobalState({
      ...globalState(),
      user: null,
      theme: "light",
      wallet: null,
      smartContractProgram: null,
    });
    navigate("/", { replace: false });
  });
};

export default Logout;
