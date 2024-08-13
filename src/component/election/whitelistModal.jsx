import { createSignal, createEffect } from "solid-js";
import { PublicKey, Transaction } from "@solana/web3.js";
import { web3 } from "@coral-xyz/anchor";
import { useGlobalContext } from "../../context/globalContext";

export function WhitelistModal({ dataWhitelist, onClose }) {
  const [status, setStatus] = createSignal("");
  const [error, setError] = createSignal("");
  const [globalState] = useGlobalContext();
  const [message, setMessage] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const isValidSolanaPublicKey = (publicKeyString) => {
    try {
      new PublicKey(publicKeyString);
      return true;
    } catch (error) {
      return false;
    }
  };

  const isWhitelistAlreadyRegistered = async (publicKey) => {
    if (isValidSolanaPublicKey(dataWhitelist.election.publicKey)) {
      let electionData =
        await globalState()?.smartContractProgram.account.election.fetchNullable(
          dataWhitelist.election.publicKey
        );
      // return await electionData.whitelist[0].toString();
      electionData = await electionData;
      return electionData.whitelist?.some((x) => x.toString() == publicKey);
    }
    return false;
  };

  const handleSubmit = async () => {
    // console.log(
    //   dataWhitelist,
    //   dataWhitelist?.address,
    //   await isWhitelistAlreadyRegistered(dataWhitelist?.address)
    // );
    // return;
    if (!globalState()?.smartContractProgram) {
      setMessage("Connect to Wallet First!");
      return;
    }

    if (!globalState()?.wallet?.publicKey) {
      setMessage("Wallet public key is missing!");
      return;
    }

    if (await isWhitelistAlreadyRegistered(dataWhitelist?.address)) {
      setMessage("Wallet Yang dipilih Telah Mendaftar Pada Whitelist!");
      return;
    }

    setLoading(true);
    setError("");

    if (!globalState()?.wallet?.signTransaction) {
      setMessage("Wallet signTransaction function is missing!");
      setLoading(false);
      return;
    }

    try {
      if (status() == "ACCEPT") {
        const connection =
          globalState().smartContractProgram.provider.connection;
        const latestBlockhash = await connection.getLatestBlockhash();

        const instruction = await globalState()
          .smartContractProgram.methods.addWhitelist()
          .accounts({
            election: dataWhitelist.election.publicKey,
            admin: globalState()?.wallet?.publicKey,
            userwallet: dataWhitelist.user.profile.address,
            systemProgram: web3.SystemProgram.programId,
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

        console.log("Whitelist transaction confirmed:", txid);
      }
      const response = await fetch(
        `https://evoting-server.vercel.app/whitelist/accept/${dataWhitelist?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({ status: status() }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Ada Sesuai Yang Salah");
      }

      setMessage(
        `Status Whitelist ${status().toLowerCase()} Berhasil DiUpdate! `
      );
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 2000);
    } catch (error) {
      setError(error.message);
      setMessage(`Tidak Dapat Memasukkan User Dalam Daftar Whitelist!`);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 2000);
    }
  };

  createEffect(() => {
    if (message()) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  });

  return (
    <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      {message() && (
        <div class="alert alert-info absolute bottom-12 left-2 z-20 px-2 py-0.5 w-max max-w-[calc(100%-16px)] sm:max-w-md">
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
              d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 34C22.9 34 22 33.1 22 32V24C22 22.9 22.9 22 24 22C25.1 22 26 22.9 26 24V32C26 33.1 25.1 34 24 34ZM26 18H22V14H26V18Z"
              fill="#0085FF"
            />
          </svg>
          <div class="flex flex-col">
            <span class="text-content2 py-1">{message()}</span>
          </div>
        </div>
      )}
      <div class="bg-[#1d1d1d] rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
        <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3
                class="text-lg leading-6 font-medium text-white"
                id="modal-title"
              >
                Perbarui Whitelist Status - {dataWhitelist.user?.name}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Pilih Status Whitelist Dibawah Ini.
                </p>
                <div class="mt-4">
                  <select
                    value={status()}
                    onChange={(e) => setStatus(e.target.value)}
                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select status</option>
                    <option value="ACCEPT">TERIMA</option>
                    <option value="DECLINE">TOLAK</option>
                  </select>
                </div>
                {error() && (
                  <p class="text-red-500 text-sm mt-2 text-wrap">{error()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div class="bg-[#1d1d1d] px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            class={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm ${
              loading() ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleSubmit}
            disabled={loading()}
          >
            {loading() ? "Submitting..." : "Submit"}
          </button>
          <button
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-slate-800 text-base font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
