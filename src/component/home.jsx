import { onMount } from "solid-js";
import { useGlobalContext } from "../context/globalContext";

const Home = () => {
  const [globalState, setGlobalState] = useGlobalContext();
  onMount(() => {
    setGlobalState({ ...globalState(), route: "/" });
  });

  return (
    <div class="flex flex-auto items-start justify-start py-12 px-4 sm:px-6 lg:px-8 bg-slate-300 bg-[url('https://res.cloudinary.com/ddd2tkuki/image/upload/v1723139251/assets_ce0c7323a97a4d91bd0baa7490ec9139_a4517ce3de2b4a79bd6f78371656734c_1_yrf99s.jpg')] bg-cover bg-center bg-blend-multiply ">
      <div class="max-w-md w-full space-y-8 ms-24">
        <div class="text-5xl font-mono font-medium">SOLANA E-VOTING</div>
      </div>
    </div>
  );
};

export default Home;
