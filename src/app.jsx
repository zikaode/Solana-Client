import { createEffect, createSignal, onMount } from "solid-js";
import { useGlobalContext } from "./context/globalContext";
import { Route, Router, useLocation } from "@solidjs/router";
import { profileUser } from "./api/profile";
import { CloverWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import { Program, AnchorProvider, web3, setProvider } from "@coral-xyz/anchor";
import idl from "../src/idl.json";

import Home from "./component/home";
import Dashboard from "./component/Dashboard";
import Login from "./component/auth/login";
import Register from "./component/auth/register";
import ForgotPassword from "./component/auth/ForgotPassword";
import ResetPassword from "./component/auth/ResetPassword";
import VerifyEmail from "./component/auth/verifyEmail";
import Logout from "./component/auth/logout";
import ProfileEdit from "./component/account/profile";
import ChangePassword from "./component/account/changePassword";
import ImageUpload from "./component/test/uploadTest";
import UserTable from "./component/user/userTable";
import getElection from "./component/election/getElection";
import getElectionVote from "./component/vote/getElection";
import getDetail from "./component/election/getDetail";
import getDetailVote from "./component/vote/getDetail";
import newElection from "./component/election/newElection";
import whitelistUpdate from "./component/election/whitelistUpdate";
import getResult from "./component/result/getResult";
import getDetailResult from "./component/result/getDetailResult";

const App = () => {
  const [globalState, setGlobalState] = useGlobalContext();
  const [errorMessage, setErrorMessage] = createSignal([]);
  const [showModal, setShowModal] = createSignal(false);
  // Konfigurasi jaringan dan koneksi
  const network = "https://api.devnet.solana.com"; // RPC-URL
  const connection = new Connection(network, "processed");
  const programId = new PublicKey(
    "GbepvWJZF45kMNecYZ1NzmmYX6XziZmK7u2obvvUCDPr"
  );

  // Inisialisasi adapter wallet
  const wallet = globalState()?.wallet || new CloverWalletAdapter();

  async function connect() {
    if (
      "solana" in window &&
      (typeof window.clover !== "undefined" ||
        typeof window.clv !== "undefined")
    ) {
      await wallet.connect();
      // Inisialisasi provider dan program Anchor
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "confirmed",
      });
      setProvider(provider);
      setGlobalState({ ...globalState(), wallet: wallet });
      localStorage.setItem("autoConnect", true);
      if (wallet?.publicKey) {
        const program = new Program(idl, programId);
        setGlobalState({ ...globalState(), smartContractProgram: program });
        const accounts = await program.account.user.all();
        console.log(accounts);
      }
    } else {
      setShowModal(true);
    }
  }

  function handleInstall() {
    window.open(
      "https://chromewebstore.google.com/detail/clv-wallet/nhnkbkgjikgcigadomkphalanndcapjk",
      "_blank"
    );
    window.location.reload();
    setShowModal(false);
  }

  async function disconnect() {
    localStorage.removeItem("autoConnect");
    await wallet.disconnect();
    setGlobalState({
      ...globalState(),
      wallet: null,
      smartContractProgram: null,
    });
  }

  onMount(async () => {
    if (localStorage.getItem("autoConnect")) {
      setTimeout(() => {
        connect();
      }, 600);
    }
    setGlobalState({ ...globalState(), loading: true });
    try {
      const user = await profileUser(localStorage.getItem("token"));
      if (user.ok) {
        const data = await user.json();
        setGlobalState({
          ...globalState(),
          user: { ...data.data },
          loading: false,
        });
      } else if (user.status === 401) {
        const { errors } = await user.json();
        setErrorMessage([...errors]);
      }
      console.log(globalState());
      setGlobalState({ ...globalState(), loading: false });
    } catch (error) {
      setGlobalState({ ...globalState(), loading: false });
      console.error("Error fetching profile:", error);
    }
  });

  return (
    <>
      <Show when={showModal()}>
        <div
          class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20"
          id="my-modal"
        >
          <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800">
            <div class="mt-3 text-center">
              <h3 class="text-lg leading-6 font-medium text-white">
                Ekstensi Wallet Tidak Terdeteksi
              </h3>
              <div class="mt-2 px-7 py-3">
                <p class="text-sm text-gray-500">
                  Ekstensi Clover Wallet Dibutuhkan Untuk Melanjutkan Penggunaan
                  Aplikasi. Ingin Menginstall?
                </p>
              </div>
              <div class="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  class="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onClick={handleInstall}
                >
                  Install Clover Wallet
                </button>
                <button
                  id="cancel-btn"
                  class="mt-3 px-4 py-2 bg-gray-300 text-gray-900 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <div class="mt-2 text-xs">
                  Harap Reload Halaman Ini Setelah Menginstall..
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>
      <div class="bg-gray-900 flex flex-col min-h-screen">
        <div class="flex-initial bg-gray-800">
          <div class="navbar rounded-lg py-4 container mx-auto bg-gray-800 text-lg">
            <div class="navbar-start">
              <a class="navbar-item" href="/">
                <span class="flex gap-4 items-center">
                  <img src="/images/newspaper.png" alt="Logo" class="w-8" />
                  <span>TGA - Solana e.Voting</span>
                </span>
              </a>
            </div>
            <div class="navbar-end">
              {globalState()?.user ? (
                <>
                  <div class="md:avatar hidden avatar-ring avatar-md">
                    <div class="dropdown-container">
                      <div class="dropdown">
                        <label
                          class="btn btn-ghost flex cursor-pointer px-0"
                          tabindex="0"
                        >
                          <img
                            src={
                              globalState()?.user?.profile?.image
                                ? globalState()?.user?.profile?.image
                                : globalState()?.clienturl +
                                  "/public/images/avatar-svgrepo-com.svg"
                            }
                            alt="avatar"
                          />
                          {globalState()?.wallet ? (
                            <span class="flex absolute h-3 w-3 top-0 right-0 -mt-[2px] -mr-[2px]">
                              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-200 opacity-60"></span>
                              <span class="relative inline-flex rounded-full h-3 w-3 bg-green-300"></span>
                            </span>
                          ) : (
                            <span class="flex absolute h-3 w-3 top-0 right-0 -mt-[2px] -mr-[2px]">
                              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60"></span>
                              <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                          )}
                        </label>
                        <div class="dropdown-menu dropdown-menu-bottom-left">
                          {globalState().route == "/" ? (
                            <>
                              <a
                                tabindex="-1"
                                class="dropdown-item text-sm"
                                href="/dashboard"
                              >
                                Ke Halaman Utama
                              </a>
                              <div class="divider my-0"></div>
                            </>
                          ) : (
                            ""
                          )}
                          {globalState()?.wallet ? (
                            <div class="dropdown-item text-sm flex gap-2">
                              <span>Solana Wallet Terhubung</span>
                              <span class="break-words text-xs">
                                {globalState()?.wallet.publicKey.toBase58()}
                              </span>
                            </div>
                          ) : (
                            ""
                          )}
                          {globalState()?.wallet ? (
                            <button
                              tabindex="-1"
                              class="dropdown-item text-sm"
                              onClick={disconnect}
                            >
                              Putuskan Wallet
                            </button>
                          ) : (
                            <button
                              tabindex="-1"
                              class="dropdown-item text-sm"
                              onClick={connect}
                            >
                              Connect ke Wallet
                            </button>
                          )}
                          <div class="divider my-0"></div>
                          <a
                            tabindex="-1"
                            class="dropdown-item text-sm"
                            href="/logout"
                          >
                            Keluar
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="md:hidden dropdown">
                    <label class="btn btn-solid-primary mx-2" tabindex="0">
                      MENU
                    </label>
                    <div class="dropdown-menu dropdown-menu-left-bottom">
                      <div class="divider my-0"></div>
                      <div class="dropdown-item text-sm flex gap-2">
                        <span>Solana Wallet Terhubung</span>
                        <span>xxx-xxx-xxx</span>
                      </div>
                      <a tabindex="-1" class="dropdown-item text-sm">
                        Connect ke Wallet
                      </a>
                      <div class="divider my-0"></div>
                      <a
                        tabindex="-1"
                        class="dropdown-item text-sm"
                        href="/logout"
                      >
                        Keluar
                      </a>
                    </div>
                  </div>
                </>
              ) : globalState()?.loading == true ? (
                ""
              ) : (
                <a
                  class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white"
                  href="/login"
                >
                  <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                    Masuk
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
        <Router>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/login" component={Login} />
          <Route path="/Register" component={Register} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password/:token" component={ResetPassword} />
          <Route path="/logout" component={Logout} />
          <Route path="/verify-email/:token" component={VerifyEmail} />
          <Route path="/profile" component={ProfileEdit} />
          <Route path="/change-password" component={ChangePassword} />
          <Route path="/image-upload/" component={ImageUpload} />
          <Route path="/users" component={UserTable} />
          <Route path="/election" component={getElection} />
          <Route path="/election-vote" component={getElectionVote} />
          <Route path="/election/:id" component={getDetail} />
          <Route path="/election-vote/:id" component={getDetailVote} />
          <Route path="/election/new" component={newElection} />
          <Route path="/election/update/:id" component={newElection} />
          <Route path="/election/whitelist/:id" component={whitelistUpdate} />
          <Route path="/result" component={getResult} />
          <Route path="/result/:id" component={getDetailResult} />
        </Router>
        <footer class="bottom-0 z-20 w-full bg-slate-400 border-t border-gray-200 shadow items-center flex justify-center p-1 dark:bg-gray-800 dark:border-gray-600">
          <span class="text-xs text-gray-700 dark:text-gray-400 sm:text-center">
            © 2024 Dzikri Arraiyan{" - "}
            <a href="https://flowbite.com/" class="hover:underline">
              Solana e.Voting{" "}
            </a>
          </span>
        </footer>
      </div>
    </>
  );
};

export default App;
