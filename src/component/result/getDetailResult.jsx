import { reload, useLocation, useNavigate, useParams } from "@solidjs/router";
import { onCleanup, createSignal, createEffect, onMount } from "solid-js";
import { useGlobalContext } from "../../context/globalContext";
import { updateAddressUser } from "../../api/profile";
import { createResource, For, Show } from "solid-js";
import { PublicKey, Transaction } from "@solana/web3.js";
import { web3 } from "@coral-xyz/anchor";
import { userInit } from "../../api/profile";
import { setTimeout } from "timers/promises";
import Sidebar from "../template/sidebar";
import Chart from "chart.js/auto";

function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
}

const processElectionData = (rawData) => {
  const candidates = rawData.data.candidates;
  const labels = [];
  const data = [];
  const backgroundColors = [];
  const borderColors = [];

  const getRandomColor = () => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const label = `Tidak Memilih`;
  labels.push(label);
  data.push(rawData.data.whitelists.length - rawData.data.ballot.length);
  const color = getRandomColor();
  backgroundColors.push(color.replace("rgb", "rgba").replace(")", ", 0.8)"));
  borderColors.push(color);

  candidates.forEach((candidate) => {
    const label = `${candidate.ketua.name} & ${candidate.wakil.name}`;
    labels.push(label);
    data.push(candidate.balloutCount);
    const color = getRandomColor();
    backgroundColors.push(color.replace("rgb", "rgba").replace(")", ", 0.8)"));
    borderColors.push(color);
  });

  return {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };
};

const fetchElectionDetail = async (id, token) => {
  const res = await fetch(
    `https://evoting-server.vercel.app/result/finished/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
};

const getDetailResult = () => {
  const [countdown, setCountdown] = createSignal(["", false]);
  const [whitelistCountdown, setWhitelistCountdown] = createSignal(["", false]);
  const [globalState, setGlobalState] = useGlobalContext();
  const [successMessage, setSuccessMessage] = createSignal("");
  const [errorMessage, setErrorMessage] = createSignal([]);
  const [resultData, setResultData] = createSignal([]);
  const [resultDataSM, setResultDataSM] = createSignal([]);
  const [chartInstance, setChartInstance] = createSignal([]);

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

  onMount(async () => {
    const data = await fetchElectionDetail(params.id, token);
    console.log(data);
    setResultData(data);
  });

  createEffect(() => {
    console.log(resultData(), processElectionData(resultData()));
    const ctx = document
      .getElementById("electionResultsChart")
      .getContext("2d");
    const processedData = processElectionData(resultData());
    console.log(processedData);

    const newChartInstance = new Chart(ctx, {
      type: "pie",
      data: processedData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Election Results - Ballout Count",
          },
        },
      },
    });
    processedData;
    setChartInstance(newChartInstance);
  }, resultData());

  return (
    <>
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
        <Show when={true} fallback={<div>Loading...</div>}>
          <Sidebar path={location.pathname}>
            <div class="flex flex-col relative">
              <button
                class="absolute left-0"
                onClick={() => {
                  navigate("/result", { replace: true });
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
              <div class="text-2xl font-bold text-center mb-3">
                Hasil Perolehan Suara
              </div>
              <div class="flex gap-2 mb-4">
                <div class="rounded-sm bg-yellow-600 p-2 flex-1 text-center">{`Jumlah Surat Suara Pada Server: ${
                  resultData()?.data?.ballot.length
                }`}</div>
                <div class="rounded-sm bg-yellow-600 p-2 flex-1 text-center">
                  {`Tidak Memilih: ${
                    resultData()?.data?.whitelists?.length -
                    resultData()?.data?.ballot?.length
                  }`}
                </div>
                <div class="rounded-sm bg-yellow-600 p-2 flex-1 text-center">
                  {globalState()?.wallet
                    ? `Jumlah Surat Suara Pada SmartContract: ${
                        globalState()?.suratSuara?.filter(
                          (x) =>
                            x.account.election.toBase58() ==
                            resultData()?.data?.publicKey
                        ).length
                      }`
                    : "Jumlah Surat Suara Pada SmartContract: Teputus"}
                </div>
              </div>
              <div class="flex gap-2 mb-8">
                <div class="w-1/2 flex justify-center items-center">
                  <div class="w-8/12">
                    <canvas
                      id="electionResultsChart"
                      width="400"
                      height="400"
                    ></canvas>
                  </div>
                </div>
                <div class="w-1/2 bg-slate-800 px-2 py-4 rounded-sm">
                  <div class="text-center font-bold text-xl mb-3">
                    PEMENANG PEMILIHAN
                  </div>
                  <div class="flex gap-2 justify-center">
                    <div class="flex flex-col justify-center gap-2">
                      <div class="w-44 rounded-lg bg-clip-padding object-contain">
                        <img
                          src={
                            resultData()?.data?.candidates.filter(
                              (x) => x.id == resultData()?.data.winner
                            )[0].ketua.profile.image
                          }
                        />
                      </div>
                      <div class="text-center text-xl font-bold">
                        {
                          resultData()?.data?.candidates.filter(
                            (x) => x.id === resultData()?.data.winner
                          )[0].ketua.name
                        }
                      </div>
                      <div class="text-center text-lg font-bold">
                        {
                          resultData()?.data?.candidates.filter(
                            (x) => x.id === resultData()?.data.winner
                          )[0].wakil.profile.jurusan
                        }
                      </div>
                    </div>
                    <div class="flex flex-col justify-center gap-2">
                      <div class="w-44 rounded-lg bg-clip-padding object-contain">
                        <img
                          src={
                            resultData()?.data?.candidates.filter(
                              (x) => x.id === resultData()?.data.winner
                            )[0].wakil.profile.image
                          }
                        />
                      </div>
                      <div class="text-center text-xl font-bold">
                        {
                          resultData()?.data?.candidates.filter(
                            (x) => x.id === resultData()?.data.winner
                          )[0].wakil.name
                        }
                      </div>
                      <div class="text-center text-lg font-bold">
                        {
                          resultData()?.data?.candidates.filter(
                            (x) => x.id === resultData()?.data.winner
                          )[0].wakil.profile.jurusan
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div class="text-xl font-bold text-center mb-2">
                  Data Surat Suara
                </div>
                <div class="mb-4 text-xs w-full">
                  <div class="w-full overflow-auto">
                    <table class="table-hover table-compact table w-full">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Nama</th>
                          <th>Wallet Address</th>
                          <th>ID Transaksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        <For each={resultData()?.data?.ballot}>
                          {(ballot, ballotIndex) => (
                            <tr>
                              <td class="p-0">{ballotIndex() + 1}</td>
                              <td>{ballot.whitelist.user.name}</td>
                              <td>
                                <a
                                  class="link link-primary"
                                  href={`https://explorer.solana.com/address/${ballot.whitelist.address}`}
                                >
                                  {truncateText(ballot.whitelist.address, 16)}
                                </a>
                              </td>
                              <td>
                                <a
                                  class="link link-secondary"
                                  href={`https://explorer.solana.com/tx/${ballot.transaction}`}
                                >
                                  {truncateText(ballot.transaction, 32)}
                                </a>
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                    {resultData()?.data?.ballot > 0 ? (
                      <div class="w-full text-center mt-2">TIDAK ADA DATA</div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Sidebar>
        </Show>
      </div>
    </>
  );
};

export default getDetailResult;
