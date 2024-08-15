import { reload, useLocation, useNavigate, useParams } from "@solidjs/router";
import { onCleanup, createSignal, createEffect } from "solid-js";
import { useGlobalContext } from "../../context/globalContext";
import { updateAddressUser } from "../../api/profile";
import { createResource, For, Show } from "solid-js";
import { PublicKey, Transaction } from "@solana/web3.js";
import { web3 } from "@coral-xyz/anchor";
import { userInit } from "../../api/profile";

const fetchElectionDetail = async (id, token) => {
  const res = await fetch(`https://evoting-server.vercel.app/election/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
};

const ElectionDetail = () => {
  const [countdown, setCountdown] = createSignal(["", false]);
  const [whitelistCountdown, setWhitelistCountdown] = createSignal(["", false]);
  const [globalState, setGlobalState] = useGlobalContext();
  const [successMessage, setSuccessMessage] = createSignal("");
  const [errorMessage, setErrorMessage] = createSignal([]);
  const [loading, setLoading] = createSignal(false);

  const params = useParams();
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();
  const location = useLocation();

  const isValidSolanaPublicKey = (publicKeyString) => {
    try {
      new PublicKey(publicKeyString);
      return true;
    } catch (error) {
      return false;
    }
  };

  const isElectionAlreadyRegistered = async (publicKey) => {
    if (isValidSolanaPublicKey(publicKey)) {
      return await globalState()?.smartContractProgram.account.election.fetch(
        publicKey
      );
    }
    return false;
  };

  const whitelistHandle = async () => {
    if (!globalState()?.wallet) {
      setErrorMessage([{ msg: " Hubungkan Wallet Terlebih Dahulu.." }]);
      setTimeout(() => {
        setErrorMessage([]);
        setSuccessMessage("");
      }, 2500);
      return;
    }
    setLoading(true);
    // return;
    try {
      const res = await updateAddressUser(
        localStorage.getItem("token") || "",
        globalState()?.wallet?.publicKey.toString(),
        true
      );
      const response = await fetch(
        "https://evoting-server.vercel.app/whitelist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({
            address: globalState()?.wallet?.publicKey.toString(),
            id: election().Data?.id,
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setErrorMessage([]);
        setSuccessMessage(data.message);
      } else {
        const data = await response.json();
        const error = new Error("Error dengan status " + response.status);
        setErrorMessage([{ msg: error.data?.errors[0]?.msg }]);
        error.status = response.status;
        error.data = data;
        throw error;
      }
    } catch (error) {
      setErrorMessage([{ msg: error.data?.errors[0]?.msg }]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setErrorMessage([]);
        setSuccessMessage("");
        refetch();
      }, 2500);
    }
  };

  const voteHandle = async (candidate, index) => {
    // user = user || userAccount.publicKey;
    // console.log(
    //   user,
    //   candidate.ketua.profile.publicKey,
    //   candidate.wakil.profile.publicKey,
    // );
    // return;

    if (!globalState()?.wallet) {
      setErrorMessage([{ msg: "Hubungkan Ke Wallet Dulu!" }]);
      setTimeout(() => {
        setErrorMessage([]);
        setSuccessMessage("");
        refetch();
      }, 2000);
      return;
    }

    if (!globalState()?.wallet?.publicKey) {
      setErrorMessage([{ msg: "Wallet public key is missing!" }]);
      setTimeout(() => {
        setErrorMessage([]);
      }, 2000);
      return;
    }

    if (!(await isElectionAlreadyRegistered(candidate.election.publicKey))) {
      setErrorMessage([
        { msg: "Tidak Ada Election Yang Terdaftar Pada SmartContract!" },
      ]);
      setTimeout(() => {
        setErrorMessage([]);
      }, 2000);
      return;
    }
    if (!globalState()?.wallet?.signTransaction) {
      setErrorMessage([{ msg: "Wallet signTransaction function is missing!" }]);
      setTimeout(() => {
        setErrorMessage([]);
      }, 2000);
      return;
    }
    if (
      !election()
        .Data.whitelists.filter((x) => x.userId === globalState().user.id)
        .some((x) => x.address == globalState().wallet.publicKey.toString())
    ) {
      const data = election().Data.whitelists.filter(
        (x) => x.userId === globalState().user.id
      )[0]?.address;
      if (data) {
        setErrorMessage([
          {
            msg: `Hubungkan Ke Wallet Yang Terdaftar Sebagai Pemilih: ${data}`,
          },
        ]);
      } else setErrorMessage([{ msg: `Tidak Terdaftar Sebagai Pemilih!` }]);
      setTimeout(() => {
        setErrorMessage([]);
      }, 2000);
      return;
    }
    setLoading(true);
    let user = null;
    const userAccount = web3.Keypair.generate();
    const connection = globalState().smartContractProgram.provider.connection;
    const latestBlockhash = await connection.getLatestBlockhash();
    if (globalState()?.user?.profile?.publicKey) {
      user = new PublicKey(globalState()?.user?.profile?.publicKey);
    }
    user = user || userAccount;

    try {
      if (!globalState()?.user?.profile?.publicKey) {
        console.log(
          "YES",
          globalState().user.profile.nim,
          globalState().user.name,
          globalState().user.email,
          globalState().user.profile.prodi,
          globalState().user.profile.jurusan,
          true,
          userAccount,
          user
        );
        await globalState()
          ?.smartContractProgram.methods.addUser(
            globalState().user.profile.nim,
            globalState().user.name,
            globalState().user.email,
            globalState().user.profile.prodi,
            globalState().user.profile.jurusan,
            true
          )
          .accounts({
            user: userAccount.publicKey,
            signer: globalState()?.wallet?.publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .signers([userAccount])
          .rpc();

        const data = await userInit(
          localStorage.getItem("token") || "",
          globalState().user.id,
          userAccount.publicKey
        );
      } else {
        const instruction = await globalState()
          ?.smartContractProgram.methods.updateUserData(
            globalState().user.profile.nim,
            globalState().user.name,
            globalState().user.email,
            globalState().user.profile.prodi,
            globalState().user.profile.jurusan
          )
          .accounts({
            user: user,
            signer: globalState()?.wallet?.publicKey,
          })
          .instruction();

        const tx = new Transaction().add(instruction);
        tx.recentBlockhash = latestBlockhash.blockhash;
        tx.feePayer = globalState()?.wallet?.publicKey;

        const signedTx = await globalState().wallet.signTransaction(tx);
        const txid = await connection.sendRawTransaction(signedTx.serialize());

        const confirmation = await connection.confirmTransaction({
          signature: txid,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });

        if (confirmation.value.err) {
          throw new Error(
            `Transaction failed: ${confirmation.value.err.toString()}`
          );
        }
      }

      const [suratSuaraPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("surat_suara"),
          new PublicKey(candidate.election.publicKey).toBuffer(),
          globalState().wallet.publicKey.toBuffer(),
        ],
        globalState()?.smartContractProgram?.programId
      );

      const instruction = await globalState()
        .smartContractProgram.methods.vote(
          new PublicKey(candidate.ketua.profile.publicKey),
          new PublicKey(candidate.wakil.profile.publicKey)
        )
        .accounts({
          election: new PublicKey(candidate.election.publicKey),
          user: user,
          voter: globalState().wallet.publicKey,
          suratSuara: suratSuaraPDA,
          systemProgram: web3.SystemProgram.programId,
        })
        .instruction();

      const tx = new Transaction().add(instruction);
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = globalState().wallet.publicKey;

      const signedTx = await globalState().wallet.signTransaction(tx);
      const txid = await connection.sendRawTransaction(signedTx.serialize());

      const response = await fetch(
        `https://evoting-server.vercel.app/ballot/vote/${election().Data?.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({
            candidateId: candidate.id,
            transaction: txid,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(`${data.errors[0].msg || JSON.stringify(data)}`);
      }

      const confirmation = await connection.confirmTransaction({
        signature: txid,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        throw new Error(`Vote Gagal!: ${confirmation.value.err.toString()}`);
      }
      const data = await response.json();
      setSuccessMessage(data.message);
    } catch (error) {
      setErrorMessage([
        {
          msg: "Gagal Melakukan Proses Vote!",
        },
      ]);
      console.error(error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setErrorMessage([]);
        setSuccessMessage("");
        refetch();
      }, 2000);
    }
  };

  createEffect(() => {
    if (!globalState()?.loading) {
      if (!globalState()?.user?.email) navigate("/", { replace: true });
    }
  });

  const [election, { refetch }] = createResource(
    () => ({ id: params.id, token }),
    async ({ id, token }) => await fetchElectionDetail(id, token)
  );

  let intervalId;

  createEffect(() => {
    if (election()?.Data?.Status === "DRAFT") {
      return;
    }

    intervalId = setInterval(() => {
      const now = new Date();
      const voteStart = new Date(election().Data.voteStart);
      const voteEnd = new Date(election().Data.voteEnd);
      if (voteStart > now) {
        const diff = voteStart - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown([
          `VOTE DIMULAI DALAM - ${days} HARI ${hours} JAM ${minutes} MENIT ${seconds} DETIK`,
          false,
        ]);
      } else if (voteEnd > now) {
        const diff = voteEnd - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown([
          `VOTE SELESAI DALAM - ${days} HARI ${hours} JAM ${minutes} MENIT ${seconds} DETIK`,
          true,
        ]);
      } else {
        setCountdown(["ELECTION VOTE TELAH SELESAI", false]);
      }

      const whitelistStart = new Date(election().Data.whitelistStart);
      const whitelistEnd = new Date(election().Data.whitelistEnd);
      if (whitelistStart > now) {
        const diff = whitelistStart - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setWhitelistCountdown([
          `WHITELIST DIMULAI DALAM - ${days} HARI ${hours} JAM ${minutes} MENIT ${seconds} DETIK`,
          false,
        ]);
      } else if (whitelistEnd > now) {
        const diff = whitelistEnd - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setWhitelistCountdown([
          `WHITELIST SELESAI DALAM - ${days} HARI ${hours} JAM ${minutes} MENIT ${seconds} DETIK`,
          true,
        ]);
      } else {
        setWhitelistCountdown(["WHITELIST TELAH SELESAI", false]);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [election]);

  return (
    <>
      <Show
        when={!election.loading}
        fallback={
          <div class="flex flex-auto items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-blend-multiply ">
            <div class="max-w-md w-full space-y-8 ms-24">
              <div class="text-2xl font-mono font-medium text-center">
                LOADING.. SEDANG MEMUAT DATA!
              </div>
            </div>
          </div>
        }
      >
        <div class="container mx-auto px-4 py-8 relative">
          <div class="text-sm text-left absolute">
            <Show
              when={errorMessage().length === 0}
              fallback={
                <div class="alert alert-error fixed bottom-8 right-8 z-20 px-2 py-0.5 w-max max-w-[calc(100%-16px)] sm:max-w-md">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-8"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 26C22.9 26 22 25.1 22 24V16C22 14.9 22.9 14 24 14C25.1 14 26 14.9 26 16V24C26 25.1 25.1 26 24 26ZM26 34H22V30H26V34Z"
                      fill="#E92C2C"
                    />
                  </svg>
                  <div class="flex flex-col">
                    <For each={errorMessage()}>
                      {(item, index) => (
                        <span class="text-content2 py-1" key={index()}>
                          {item.msg}
                        </span>
                      )}
                    </For>
                  </div>
                </div>
              }
            ></Show>
            {!(successMessage().length === 0) && (
              <div class="alert alert-success fixed bottom-8 right-8 z-20 px-2 py-0.5 w-max max-w-[calc(100%-16px)] sm:max-w-md">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-8"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM18.58 32.58L11.4 25.4C10.62 24.62 10.62 23.36 11.4 22.58C12.18 21.8 13.44 21.8 14.22 22.58L20 28.34L33.76 14.58C34.54 13.8 35.8 13.8 36.58 14.58C37.36 15.36 37.36 16.62 36.58 17.4L21.4 32.58C20.64 33.36 19.36 33.36 18.58 32.58Z"
                    fill="#00BA34"
                  />
                </svg>
                <div class="flex flex-col">
                  <span class="text-content2 py-1">{successMessage()}</span>
                </div>
              </div>
            )}
          </div>
          <Show
            when={election()}
            fallback={<div>Pemilihan Tidak Ditemukan</div>}
          >
            {election() && (
              <div class="flex flex-col justify-center items-center gap-2">
                <div class="flex w-full justify-center items-center relative mb-8">
                  <button
                    class="absolute left-0"
                    onClick={() => {
                      navigate("/election-vote", { replace: true });
                    }}
                  >
                    <img
                      width="50"
                      height="50"
                      src="https://img.icons8.com/ios/50/circled-left-2.png"
                      alt="circled-left-2"
                      class="w-8 invert hover:bg-yellow-700 rounded-full"
                    />
                  </button>
                  <div>
                    <h1 class="text-2xl font-bold underline underline-offset-2">
                      {election().Data.name}
                    </h1>
                    <p class="w-full text-center text-base mt-2">
                      {election().Data.organization
                        ? election().Data.organization
                        : "Not set"}
                    </p>
                  </div>
                  <p
                    class={`badge badge-xs p-2 text-center absolute right-0 ${
                      election().Data.Status === "FINISH"
                        ? "badge-outline-success"
                        : "badge-outline-warning"
                    }`}
                  >
                    {election().Data.Status === "DRAFT"
                      ? "Not Set"
                      : election().Data.Status}
                  </p>
                </div>
                <div class="flex flex-col justify-center items-center gap-2 mb-4">
                  {/* <p>
                  <span class="font-medium">Start Date:</span>{" "}
                  {election().Data.voteStart
                    ? new Date(election().Data.voteStart).toLocaleString()
                    : "Not set"}
                </p>
                <p>
                  <span class="font-medium">End Date:</span>{" "}
                  {election().Data.voteEnd
                    ? new Date(election().Data.voteEnd).toLocaleString()
                    : "Not set"}
                </p> */}
                  <p class="w-full text-center">
                    {election().Data.description
                      ? election().Data.description
                      : "Not set"}
                  </p>
                  {/* <p>
                  <span class="font-medium">Whitelist Start:</span>{" "}
                  {election().Data.whitelistStart
                    ? new Date(election().Data.whitelistStart).toLocaleString()
                    : "Not set"}
                </p>
                <p>
                  <span class="font-medium">Whitelist End:</span>{" "}
                  {election().Data.whitelistEnd
                    ? new Date(election().Data.whitelistEnd).toLocaleString()
                    : "Not set"}
                </p> */}
                </div>
                <ol class="items-center sm:flex">
                  <li class="relative mb-6 sm:mb-0">
                    <div class="flex items-center">
                      <div class="z-10 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-0 ring-white dark:bg-blue-900 sm:ring-8 dark:ring-gray-900 shrink-0">
                        <svg
                          class="w-2.5 h-2.5 text-blue-800 dark:text-blue-300"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                        </svg>
                      </div>
                      <div class="hidden sm:flex w-full bg-gray-200 h-0.5 dark:bg-gray-700"></div>
                    </div>
                    <div class="mt-3 sm:pe-8">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Jadwal Mulai WhiteList
                      </h3>
                      <time class="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                        {election().Data.whitelistStart
                          ? new Date(
                              election().Data.whitelistStart
                            ).toLocaleString()
                          : "Not set"}
                      </time>
                    </div>
                  </li>
                  <li class="relative mb-6 sm:mb-0">
                    <div class="flex items-center">
                      <div class="z-10 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-0 ring-white dark:bg-blue-900 sm:ring-8 dark:ring-gray-900 shrink-0">
                        <svg
                          class="w-2.5 h-2.5 text-blue-800 dark:text-blue-300"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                        </svg>
                      </div>
                      <div class="hidden sm:flex w-full bg-gray-200 h-0.5 dark:bg-gray-700"></div>
                    </div>
                    <div class="mt-3 sm:pe-8">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Jadwal Selesai WhiteList
                      </h3>
                      <time class="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                        {election().Data.whitelistEnd
                          ? new Date(
                              election().Data.whitelistEnd
                            ).toLocaleString()
                          : "Not set"}
                      </time>
                    </div>
                  </li>
                  <li class="relative mb-6 sm:mb-0">
                    <div class="flex items-center">
                      <div class="z-10 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-0 ring-white dark:bg-blue-900 sm:ring-8 dark:ring-gray-900 shrink-0">
                        <svg
                          class="w-2.5 h-2.5 text-blue-800 dark:text-blue-300"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                        </svg>
                      </div>
                      <div class="hidden sm:flex w-full bg-gray-200 h-0.5 dark:bg-gray-700"></div>
                    </div>
                    <div class="mt-3 sm:pe-8">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Jadwal Mulai Voting
                      </h3>
                      <time class="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                        {election().Data.voteStart
                          ? new Date(election().Data.voteStart).toLocaleString()
                          : "Not set"}
                      </time>
                    </div>
                  </li>
                  <li class="relative mb-6 sm:mb-0">
                    <div class="flex items-center">
                      <div class="z-10 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-0 ring-white dark:bg-blue-900 sm:ring-8 dark:ring-gray-900 shrink-0">
                        <svg
                          class="w-2.5 h-2.5 text-blue-800 dark:text-blue-300"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                        </svg>
                      </div>
                      <div class="hidden sm:flex w-full bg-gray-200 h-0.5 dark:bg-gray-700"></div>
                      {/* <div class="z-10 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-0 ring-white dark:bg-blue-900 sm:ring-8 dark:ring-gray-900 shrink-0">
                        <svg
                          class="w-2.5 h-2.5 text-blue-800 dark:text-blue-300"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                        </svg>
                      </div> */}
                    </div>
                    <div class="mt-3 sm:pe-8">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Jadwal Selesai Voting
                      </h3>
                      <time class="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                        {election().Data.voteEnd
                          ? new Date(election().Data.voteEnd).toLocaleString()
                          : "Not set"}
                      </time>
                    </div>
                  </li>
                </ol>
                {election().Data.Status !== "DRAFT" && (
                  <div class="flex flex-col items-center justify-between mb-12">
                    <div class="flex gap-2 items-center justify-center">
                      <div class="alert alert-info rounded-md text-sm  min-w-max">
                        <p class="text-center">{whitelistCountdown()[0]}</p>
                      </div>
                      <div class="alert alert-info rounded-md text-sm  min-w-max">
                        <p class="text-center">{countdown()[0]}</p>
                      </div>
                    </div>
                    <div class="mt-4 flex gap-2">
                      {election()?.Data?.whitelists[
                        election()?.Data?.whitelists?.findIndex(
                          (x) => x.userId == globalState()?.user?.id
                        )
                      ]?.ballot ? (
                        ""
                      ) : !election()?.Data?.whitelists?.find(
                          (x) => x.userId == globalState()?.user?.id
                        ) ? (
                        <button
                          class={
                            "btn btn-primary py-8 " +
                            (loading() && "btn-loading")
                          }
                          disabled={!whitelistCountdown()[1]}
                          onClick={whitelistHandle}
                        >
                          <div class="">
                            Daftar Whitelist Dengan Wallet
                            <br />
                            <span class="text-xs">
                              {globalState()?.wallet?.publicKey.toString() ||
                                "Hubungkan Ke Wallet Terlebih Dahulu!"}
                            </span>
                          </div>
                        </button>
                      ) : (
                        <div class="btn bg-slate-800">
                          Status Whitelist -{" "}
                          {election()
                            ?.Data?.whitelists[
                              election()?.Data?.whitelists?.findIndex(
                                (x) => x.userId == globalState()?.user?.id
                              )
                            ].status.toLowerCase()
                            .replace(/^\w/, (c) => c.toUpperCase())}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div class="w-full">
                  <h2 class="text-xl font-semibold mb-12 text-center">
                    DAFTAR KANDIDAT
                  </h2>
                  <div class="flex flex-row gap-4 bg-black bg-opacity-10 rounded-xl justify-between flex-wrap">
                    <For each={election().Data.candidate}>
                      {(candidate, index) => (
                        <div class="bg-slate-800 shadow-md rounded-lg p-6 flex flex-col w-[calc(50%-8px)]">
                          <div
                            class={`flex absolute ${
                              countdown()[1]
                                ? "justify-between"
                                : "justify-start"
                            } mb-2`}
                          >
                            <h2 class="text-lg rounded-full bg-slate-900 mb-2 w-8 h-8 items-center justify-center flex absolute -top-8 -left-8 border">
                              {index() + 1}
                            </h2>
                          </div>
                          <div class="flex gap-2 justify-around">
                            <div>
                              <h2 class="font-bold">KETUA</h2>
                              <h3 class="text-lg font-semibold">
                                {candidate.ketua.name}
                              </h3>
                              <h3 class="text-lg font-semibold">
                                ({candidate.ketua.profile?.nim})
                              </h3>
                              <p class="text-gray-400">
                                {candidate.ketua.email}
                              </p>
                              <p class="text-gray-400">
                                {candidate.ketua.profile?.jurusan}
                              </p>
                              <p class="text-gray-400 mb-4">
                                {candidate.ketua.profile?.prodi.replace(
                                  "_",
                                  " "
                                )}
                              </p>
                              <img
                                src={candidate.ketua.profile?.image}
                                alt={candidate.ketua.name}
                                class="object-cover rounded-md mb-4 mx-auto h-[28rem]"
                              />
                            </div>
                            <div>
                              <h2 class="font-bold">WAKIL</h2>
                              <h3 class="text-lg font-semibold">
                                {candidate.wakil.name}
                              </h3>
                              <h3 class="text-lg font-semibold">
                                ({candidate.wakil.profile?.nim})
                              </h3>
                              <p class="text-gray-400">
                                {candidate.wakil.email}
                              </p>
                              <p class="text-gray-400">
                                {candidate.wakil.profile?.jurusan}
                              </p>
                              <p class="text-gray-400 mb-4">
                                {candidate.wakil.profile?.prodi.replace(
                                  "_",
                                  " "
                                )}
                              </p>
                              <img
                                src={candidate.wakil.profile?.image}
                                alt={candidate.wakil.name}
                                class="object-cover rounded-md mb-4 mx-auto h-[28rem]"
                              />
                            </div>
                          </div>
                          <Show
                            when={!countdown()[1]}
                            fallback={
                              <button
                                class={`btn ${
                                  election()?.Data?.whitelists[
                                    election()?.Data?.whitelists?.findIndex(
                                      (x) => x.userId == globalState()?.user?.id
                                    )
                                  ]?.ballot
                                    ? "hidden"
                                    : "btn-warning"
                                }`}
                                onClick={() => {
                                  voteHandle(candidate, index());
                                }}
                              >
                                PILIH
                              </button>
                            }
                          ></Show>
                          <Show
                            when={
                              !countdown()[1] ^
                              (election()?.Data?.Status == "FINISH")
                            }
                            fallback={
                              election()?.Data?.whitelists[
                                election()?.Data?.whitelists?.findIndex(
                                  (x) => x.userId == globalState()?.user?.id
                                )
                              ]?.ballot?.voteId == candidate.id ? (
                                <div
                                  class={`btn btn-success`}
                                  onClick={() => {
                                    voteHandle(candidate, index());
                                  }}
                                >
                                  DIPILIH
                                </div>
                              ) : (
                                <div
                                  class={`btn btn-error ${
                                    election()?.Data?.whitelists[
                                      election()?.Data?.whitelists?.findIndex(
                                        (x) =>
                                          x.userId == globalState()?.user?.id
                                      )
                                    ]?.ballot
                                      ? ""
                                      : "hidden"
                                  }`}
                                  onClick={() => {
                                    voteHandle(candidate, index());
                                  }}
                                >
                                  ---
                                </div>
                              )
                            }
                          ></Show>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
                {/* <Show when={election().Data.saksi}>
                <div class="mb-8 flex flex-col items-center justify-center w-full gap-2">
                  <h2 class="text-xl font-semibold mb-4 text-center">Saksi</h2>
                  <For each={election().Data.saksi}>
                    {(saksi, index) => (
                      <div class="bg-slate-800 rounded-lg">
                        <div class="flex flex-row gap-2 justify-center items-center px-4 py-2">
                          <div class="p-2"># {index() + 1}</div>
                          <div class="p-2">
                            <img
                              src={saksi.profile?.image}
                              alt={saksi.name}
                              class="avatar"
                            />
                          </div>
                          <div class="p-2">
                            {saksi.name} ({saksi.profile?.nim})
                          </div>
                          <div class="p-2">
                            {saksi.profile?.jurusan} - {saksi.profile?.prodi}
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show> */}
                <Show
                  when={election().Data.whitelists || election().Data.exception}
                >
                  <div class="mb-8 rounded-lg bg-slate-800 p-4 w-full">
                    <h2 class="text-xl font-semibold mb-4">
                      Informasi Pemilihan
                    </h2>
                    <Show when={election().Data.whitelists}>
                      <p>
                        <span class="font-medium">Jumlah Whitelist:</span>{" "}
                        {election().Data.whitelists.length}
                      </p>
                    </Show>
                    <Show when={election().Data.whitelists}>
                      <p>
                        <span class="font-medium">Telah Memilih:</span>{" "}
                        {
                          election().Data.whitelists.filter(
                            (i) => i?.ballot?.isvalid == true
                          ).length
                        }
                      </p>
                    </Show>
                    <Show when={election().Data.exception}>
                      <p>
                        <span class="font-medium">Dikecualikan:</span>{" "}
                        {election().Data.exception.length}
                      </p>
                    </Show>
                  </div>
                </Show>
              </div>
            )}
          </Show>
        </div>
      </Show>
    </>
  );
};

export default ElectionDetail;
