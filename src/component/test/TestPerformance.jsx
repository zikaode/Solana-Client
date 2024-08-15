import { createSignal, onMount } from "solid-js";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
import bs58 from "bs58";
import idl from "./idl.json";
import fs from "fs";
import { web3 } from "@coral-xyz/anchor";

const TestPerformance = () => {
  const [status, setStatus] = createSignal("");
  const [results, setResults] = createSignal({});
  let program;
  let provider;
  let wallet;
  let connection;
  let funderWallet;
  const createdAccounts = [];

  onMount(async () => {
    connection = new Connection("https://api.devnet.solana.com", "confirmed");
    wallet = new UnsafeBurnerWalletAdapter();
    await wallet.connect();
    console.log("Address : " + wallet.publicKey);
    provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    const programId = new PublicKey(
      "4TS9fZfFdyHtiuM6MyMpXupme4V8oc6YpHsVWoJScPuR"
    );
    program = new Program(idl, programId, provider);

    // Check funderWallet balance
    const balance = await connection.getBalance(wallet.publicKey);

    if (balance < LAMPORTS_PER_SOL) {
      console.warn(
        "Funder wallet balance is low. You may need to add more SOL."
      );
    }
  });

  const testAddUser = async (totalTransactions) => {
    let successCount = 0;
    let totalGasFee = 0;
    let totalTime = 0;
    let transactionData = "--- Add User Transactions ---\n";

    for (let i = 0; i < totalTransactions; i++) {
      try {
        const newAccount = web3.Keypair.generate();
        const balance = await connection.getBalance(wallet.publicKey);
        const nim = `NIM${i}`;
        const nama = `Nama${i}`;
        const email = `email${i}@example.com`;
        const prodi = "Teknik Informatika";
        const jurusan = "Teknik";

        const txStartTime = Date.now();

        const tx = await program.methods
          .addUser(nim, nama, email, prodi, jurusan, true)
          .accounts({
            user: newAccount.publicKey,
            signer: wallet.publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .signers([newAccount])
          .rpc();

        const txEndTime = Date.now();
        const txTime = txEndTime - txStartTime;

        const txDetails = await connection.getTransaction(tx, {
          maxSupportedTransactionVersion: 0,
        });
        const balance_post = await connection.getBalance(wallet.publicKey);
        const gasFee =
          txDetails.meta.fee / LAMPORTS_PER_SOL +
          balance / LAMPORTS_PER_SOL -
          balance_post / LAMPORTS_PER_SOL; // Convert lamports to SOL

        totalGasFee += gasFee;
        totalTime += txTime;

        successCount++;
        createdAccounts.push(newAccount);
        setStatus(`Add User: ${successCount}/${totalTransactions}`);

        transactionData += `Add User ${
          i + 1
        }: Gas Fee = ${gasFee} SOL, Waktu = ${txTime} ms\n`;
      } catch (error) {
        console.error(`Error pada Add User ${i + 1}:`, error);
        transactionData += `Add User ${i + 1}: Error - ${error.message}\n`;
      }
    }

    return { successCount, totalGasFee, totalTime, transactionData };
  };

  const testUpdateUser = async (totalTransactions) => {
    let successCount = 0;
    let totalGasFee = 0;
    let totalTime = 0;
    let transactionData = "\n--- Update User Transactions ---\n";

    for (let i = 0; i < totalTransactions; i++) {
      try {
        if (i >= createdAccounts.length) break;
        const balance = await connection.getBalance(wallet.publicKey);
        const userAccount = createdAccounts[i];
        const nim = `UpdatedNIM${i}`;
        const nama = `UpdatedNama${i}`;
        const email = `updated_email${i}@example.com`;
        const prodi = "Updated Prodi";
        const jurusan = "Updated Jurusan";

        const txStartTime = Date.now();

        const tx = await program.methods
          .updateUserData(nim, nama, email, prodi, jurusan)
          .accounts({
            user: userAccount.publicKey,
            signer: wallet.publicKey,
          })
          .signers([wallet._keypair])
          .rpc();

        const txEndTime = Date.now();
        const txTime = txEndTime - txStartTime;

        const txDetails = await connection.getTransaction(tx, {
          maxSupportedTransactionVersion: 0,
        });
        const balance_post = await connection.getBalance(wallet.publicKey);
        const gasFee =
          txDetails.meta.fee / LAMPORTS_PER_SOL +
          balance / LAMPORTS_PER_SOL -
          balance_post / LAMPORTS_PER_SOL; // Convert lamports to SOL

        totalGasFee += gasFee;
        totalTime += txTime;

        successCount++;
        setStatus(`Update User: ${successCount}/${totalTransactions}`);

        transactionData += `Update User ${
          i + 1
        }: Gas Fee = ${gasFee} SOL, Waktu = ${txTime} ms\n`;
      } catch (error) {
        console.error(`Error pada Update User ${i + 1}:`, error);
        transactionData += `Update User ${i + 1}: Error - ${error.message}\n`;
      }
    }

    return { successCount, totalGasFee, totalTime, transactionData };
  };

  const testTransactions = async () => {
    setStatus("Memulai pengujian...");
    const totalTransactions = 50;
    const startTime = Date.now();

    const addResults = await testAddUser(totalTransactions);
    const updateResults = await testUpdateUser(totalTransactions);

    const endTime = Date.now();
    const totalTimeSeconds = (endTime - startTime) / 1000;

    const finalResults = {
      addUser: {
        totalTransactions,
        successCount: addResults.successCount,
        averageGasFee: addResults.totalGasFee / addResults.successCount,
        averageTime: addResults.totalTime / addResults.successCount,
      },
      updateUser: {
        totalTransactions,
        successCount: updateResults.successCount,
        averageGasFee: updateResults.totalGasFee / updateResults.successCount,
        averageTime: updateResults.totalTime / updateResults.successCount,
      },
      totalSuccessCount: addResults.successCount + updateResults.successCount,
      tps:
        (addResults.successCount + updateResults.successCount) /
        totalTimeSeconds,
    };

    setResults(finalResults);

    // Save transaction data to file
    const allTransactionData =
      addResults.transactionData + updateResults.transactionData;
    console.log(allTransactionData);
    fs.writeFileSync("transaction_data.txt", allTransactionData);

    setStatus(
      `Pengujian selesai. Total transaksi berhasil: ${
        finalResults.totalSuccessCount
      }/${totalTransactions * 2}`
    );
  };

  return (
    <div>
      <h1>Pengujian Smart Contract</h1>
      <button onClick={testTransactions}>
        Mulai 50 Transaksi Add User + 50 Update User
      </button>
      <p>Status: {status()}</p>
      <Show when={Object.keys(results()).length > 0}>
        <div>
          <h2>Hasil Pengujian:</h2>
          <h3>Add User:</h3>
          <p>Total Transaksi: {results().addUser.totalTransactions}</p>
          <p>Transaksi Berhasil: {results().addUser.successCount}</p>
          <p>
            Gas Fee Rata-rata: {results().addUser.averageGasFee.toFixed(6)} SOL
          </p>
          <p>
            Waktu Transaksi Rata-rata:{" "}
            {results().addUser.averageTime.toFixed(2)} ms
          </p>
          <h3>Update User:</h3>
          <p>Total Transaksi: {results().updateUser.totalTransactions}</p>
          <p>Transaksi Berhasil: {results().updateUser.successCount}</p>
          <p>
            Gas Fee Rata-rata: {results().updateUser.averageGasFee.toFixed(6)}{" "}
            SOL
          </p>
          <p>
            Waktu Transaksi Rata-rata:{" "}
            {results().updateUser.averageTime.toFixed(2)} ms
          </p>
          <h3>Total:</h3>
          <p>Total Transaksi Berhasil: {results().totalSuccessCount}</p>
          <p>TPS: {results().tps.toFixed(2)}</p>
        </div>
      </Show>
    </div>
  );
};

export default TestPerformance;
