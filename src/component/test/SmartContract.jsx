import { createSignal, onMount } from "solid-js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import { Program, AnchorProvider, web3, setProvider } from "@coral-xyz/anchor";
import idl from "./idl.json";

// Konfigurasi jaringan dan koneksi
const network = "https://api.devnet.solana.com";
const connection = new Connection(network, "confirmed");

// Inisialisasi adapter wallet
const wallet = new PhantomWalletAdapter();
wallet.on("connect", () => console.log("Connected to wallet"));
wallet.on("disconnect", () => console.log("Disconnected from wallet"));

// Inisialisasi provider dan program Anchor
const provider = new AnchorProvider(connection, wallet, {
  preflightCommitment: "confirmed",
});
setProvider(provider);

const programId = new PublicKey("9WFp974wC9kb5t99mJLfM7z9Cb7qoJbT86qdr2bnDprg");
console.log(programId);
// State untuk counter dan public key
const [counter, setCounter] = createSignal(null);
const [count, setCount] = createSignal(null);
const [connected, setConnected] = createSignal(false);
const [balance, setBalance] = createSignal(0);
const [program, setProgram] = createSignal(null);
const [transactionUrl, setTransactionUrl] = createSignal(null);

const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
  units: 200_000,
});

async function connectWallet() {
  await wallet.connect();
  setConnected(true);
  await fetchBalance();
  console.log(wallet?.publicKey, provider);
  if (wallet?.publicKey) {
    let program = new Program(idl, programId);
    setProgram(program);
    const accounts = await program.account.counter.all();
    console.log(accounts);
  }
}

// Fungsi untuk mengambil saldo wallet
async function fetchBalance() {
  const balance = await connection.getBalance(wallet.publicKey);
  setBalance(balance / web3.LAMPORTS_PER_SOL); // Konversi dari lamports ke SOL
}

// Fungsi untuk inisialisasi counter
async function initializeCounter() {
  try {
    // Buat keypair baru untuk akun counter
    const counterAccount = Keypair.generate();
    console.log(counterAccount, wallet.publicKey, SystemProgram.programId);

    const transaction = await program()
      .methods.initialize()
      .accounts({
        counter: counterAccount.publicKey,
        user: wallet.publicKey,
        // systemAccount: web3.SystemProgram.programId,
      })
      .signers([counterAccount])
      .transaction();

    transaction.add(modifyComputeUnits);

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Partial sign dengan counterAccount
    transaction.partialSign(counterAccount);

    // Kirim transaksi ke wallet untuk ditandatangani
    const signedTransaction = await wallet.signTransaction(transaction);

    // Kirim transaksi yang sudah ditandatangani
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    // Tunggu konfirmasi transaksi
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    if (confirmation.value.err) {
      throw new Error("Transaction failed to confirm");
    }

    console.log("Transaction confirmed:", signature);

    setTransactionUrl(
      `https://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
    setCounter(counterAccount.publicKey);

    console.log("Counter initialized!", transactionUrl());

    // Perbarui state counter
    await fetchCounter();
  } catch (error) {
    console.error("Failed to initialize counter:", error);
  }
}

// Fungsi untuk increment counter
async function incrementCounter() {
  console.log(counter());
  const sig = await program()
    .methods.increment()
    .accounts({
      counter: counter(),
      user: wallet.publicKey,
    })
    .rpc();
  // Perbarui state counter
  await fetchCounter();
  setTransactionUrl(`https://explorer.solana.com/tx/${sig}?cluster=devnet`);
}

// Fungsi untuk mengambil nilai counter
async function fetchCounter() {
  try {
    await fetchBalance();
    console.log(await program().account.counter.all());
    const counterAccount = await program().account.counter.fetch(counter());
    setCount(counterAccount.count.toNumber());
  } catch (error) {
    console.error("Failed to fetch counter:", error);
  }
}

// Komponen utama aplikasi SolidJS
function SmartContract() {
  // Fungsi untuk menghubungkan wallet
  onMount(async () => {
    connectWallet();
  });
  return (
    <div class="min-h-screen flex flex-col items-center justify-center">
      <h1 class="text-3xl font-bold mb-6">Solana SolidJS App</h1>
      <button
        class={`mb-4 px-4 py-2 rounded ${
          connected() ? "bg-green-500 text-white" : "bg-blue-500 text-white"
        }`}
        onClick={connectWallet}
      >
        {connected() ? "Wallet Connected" : "Connect Wallet"}
      </button>
      {connected() && (
        <>
          <div class="mb-4">
            <p>Wallet Balance: {balance()} SOL</p>
          </div>
          <button
            class="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={initializeCounter}
          >
            Initialize Counter
          </button>
          <button
            class="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={incrementCounter}
          >
            Increment Counter
          </button>
          <div>
            <p>Current Count: {count()}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default SmartContract;
