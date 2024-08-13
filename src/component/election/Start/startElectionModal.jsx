import { createSignal } from "solid-js";
import { useGlobalContext } from "../../../context/globalContext";
import { web3, BN } from "@coral-xyz/anchor";
import { PublicKey, Transaction } from "@solana/web3.js";

export function StartElectionModal({ election, onClose }) {
  const [pending, setPending] = createSignal("");
  const [votetime, setVoteTime] = createSignal("");
  const [whitelistStart, setWhitelistStart] = createSignal("");
  const [whitelistEnd, setWhitelistEnd] = createSignal("");
  const [message, setMessage] = createSignal("");

  const [globalState, setGlobalState] = useGlobalContext();

  function isValidSolanaPublicKey(publicKeyString) {
    try {
      new PublicKey(publicKeyString);
      return true;
    } catch (error) {
      return false;
    }
  }

  const isElectionAlreadyRegistered = async () => {
    if (isValidSolanaPublicKey(election?.publicKey)) {
      return await globalState()?.smartContractProgram.account.election.fetch(
        election?.publicKey
      );
    }
    return false;
  };

  const calculateElectionDates = () => {
    const whitelistStartDate = new Date(whitelistStart());
    const whitelistEndDate = new Date(
      whitelistStartDate.getTime() + whitelistEnd() * 60 * 60 * 1000
    );
    const voteStartDate = new Date(
      whitelistEndDate.getTime() + pending() * 60 * 60 * 1000
    );
    const voteEndDate = new Date(
      voteStartDate.getTime() + votetime() * 60 * 60 * 1000
    );

    return {
      whitelistStart: Math.floor(whitelistStartDate.getTime() / 1000),
      whitelistEnd: Math.floor(whitelistEndDate.getTime() / 1000),
      voteStart: Math.floor(voteStartDate.getTime() / 1000),
      voteEnd: Math.floor(voteEndDate.getTime() / 1000),
    };
  };

  const handleStartElection = async () => {
    if (!globalState()?.smartContractProgram) {
      setMessage("Hubungkan Wallet Terlebih Dahulu!");
      return;
    }

    if (!globalState()?.wallet?.publicKey) {
      setMessage("Wallet public key is missing!");
      return;
    }

    if (await isElectionAlreadyRegistered()) {
      setMessage("Pemilihan Ini Telah Diinisialisasi Pada SmartContract!");
      return;
    }

    const electionDates = calculateElectionDates();
    const electionAccount = web3.Keypair.generate();

    try {
      await addElectionToSmartContract(electionAccount, electionDates);
      await addCandidatesToSmartContract(electionAccount);
      await updateElectionOnServer(electionAccount, electionDates);

      setMessage("Election/Pemilihan Berhasil Dimulai!");
    } catch (err) {
      console.error(err);
      setMessage(`Gagal Memulai Election/pemilihan!`);
    } finally {
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 2000);
    }
  };

  const addElectionToSmartContract = async (electionAccount, dates) => {
    if (!globalState()?.wallet?.signTransaction) {
      throw new Error("Wallet signTransaction function is missing!");
    }

    try {
      const connection = globalState().smartContractProgram.provider.connection;

      const instruction = await globalState()
        ?.smartContractProgram.methods.addElection(
          election().name,
          new BN(dates.whitelistStart),
          new BN(dates.whitelistEnd),
          new BN(dates.voteStart),
          new BN(dates.voteEnd),
          election().organization,
          election().description
        )
        .accounts({
          election: electionAccount.publicKey,
          admin: globalState()?.wallet?.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .instruction();

      const latestBlockhash = await connection.getLatestBlockhash();

      const tx = new Transaction().add(instruction);
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = globalState().wallet.publicKey;

      // Sign the transaction with the electionAccount
      tx.partialSign(electionAccount);

      // Sign the transaction with the wallet
      const signedTx = await globalState().wallet.signTransaction(tx);

      // Send the signed transaction
      const txid = await connection.sendRawTransaction(signedTx.serialize());

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        signature: txid,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        throw new Error(
          `Transaksi Gagal: ${confirmation.value.err.toString()}`
        );
      }
    } catch (error) {
      console.error("Error in addElectionToSmartContract:", error);
      throw new Error(
        `Gagal Menambahkan Pemilihan Ke SmartContract: ${error.message}`
      );
    }
  };

  const addCandidatesToSmartContract = async (electionAccount) => {
    if (!globalState()?.wallet?.signAllTransactions) {
      throw new Error("Wallet signAllTransactions function is missing!");
    }

    const connection = globalState().smartContractProgram.provider.connection;
    const latestBlockhash = await connection.getLatestBlockhash();

    const transactions = [];

    for (const candidate of election().candidate) {
      try {
        const instruction = await globalState()
          ?.smartContractProgram.methods.addCandidate()
          .accounts({
            election: electionAccount.publicKey,
            admin: globalState()?.wallet?.publicKey,
            ketuaAccount: candidate.ketua.profile.publicKey,
            wakilAccount: candidate.wakil.profile.publicKey,
          })
          .instruction();

        const tx = new Transaction().add(instruction);
        tx.recentBlockhash = latestBlockhash.blockhash;
        tx.feePayer = globalState().wallet.publicKey;

        transactions.push(tx);
      } catch (error) {
        console.error("Error in creating addCandidate transaction:", error);
        throw new Error(
          `Gagal Menambahkan Candidate Ke Election: ${error.message}`
        );
      }
    }

    try {
      // Sign all transactions with the wallet
      const signedTxs = await globalState().wallet.signAllTransactions(
        transactions
      );

      // Send all signed transactions
      for (const signedTx of signedTxs) {
        const txid = await connection.sendRawTransaction(signedTx.serialize());

        // Wait for confirmation
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
    } catch (error) {
      console.error("Error in sending addCandidate transactions:", error);
      throw new Error(
        `Gagal Menambahkan Kandidat Dalam Pemilihan: ${error.message}`
      );
    }
  };

  const updateElectionOnServer = async (electionAccount, dates) => {
    const serverUrl = "https://evoting-server.vercel.app/election";
    const response = await fetch(`${serverUrl}/start/${election().id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify({
        pending: parseInt(pending()),
        votetime: parseInt(votetime()),
        whitelistStart: new Date(whitelistStart()).toISOString(),
        whitelistEnd: parseInt(whitelistEnd()),
        publicKey: electionAccount.publicKey,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Server error: ${errorData.message}`);
    }
  };

  return (
    <>
      <input
        class="modal-state"
        id="start-election-modal"
        type="checkbox"
        checked
      />
      <div class="modal w-full">
        {!(message().length === 0) && (
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
        <label
          class="modal-overlay"
          for="start-election-modal"
          onClick={onClose}
        ></label>
        <div class="modal-content flex flex-col gap-5 w-full">
          <label
            for="start-election-modal"
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </label>
          <h2 class="text-xl text-center">Mulai Pemilihan</h2>

          <div>
            <label
              for="whiteliststart"
              class="block text-sm font-medium text-gray-700"
            >
              Jadwal Mulai Whitelist
            </label>
            <input
              id="whiteliststart"
              type="datetime-local"
              value={whitelistStart()}
              onInput={(e) => setWhitelistStart(e.target.value)}
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-2 py-1 text-base"
              required
            />
          </div>
          <div>
            <label
              for="whitelistEnd"
              class="block text-sm font-medium text-gray-700"
            >
              Jadwal Berakhir Whitelist (Jam)
            </label>
            <input
              id="whitelistEnd"
              type="number"
              value={whitelistEnd()}
              onInput={(e) => setWhitelistEnd(e.target.value)}
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm  px-2 py-1 text-base"
              required
            />
          </div>
          <div class="space-y-4">
            <div>
              <label
                for="pending"
                class="block text-sm font-medium text-gray-700"
              >
                Waktu Tunggu (Jam)
              </label>
              <input
                id="pending"
                type="number"
                value={pending()}
                onInput={(e) => setPending(e.target.value)}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm  px-2 py-1 text-base"
                required
              />
            </div>
            <div>
              <label
                for="votetime"
                class="block text-sm font-medium text-gray-700"
              >
                Lamanya Masa Voting (Jam)
              </label>
              <input
                id="votetime"
                type="number"
                value={votetime()}
                onInput={(e) => setVoteTime(e.target.value)}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm  px-2 py-1 text-base"
                required
              />
            </div>
            <div class="flex gap-3">
              <button class="btn btn-primary" onClick={handleStartElection}>
                Mulai Pemilihan
              </button>
              <button class="btn" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
