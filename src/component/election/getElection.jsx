import {
  For,
  createSignal,
  createResource,
  createEffect,
  onCleanup,
  Show,
  onMount,
} from "solid-js";
import { useLocation, useNavigate, useParams } from "@solidjs/router";
import Sidebar from "../template/sidebar";
// import ActionModal from "./actionModal";
import { useGlobalContext } from "../../context/globalContext";
import { StartElectionModal } from "./Start/startElectionModal";
import { UpdateElectionModal } from "./Start/updateElectionModal";
import { web3 } from "@coral-xyz/anchor";
import { PublicKey, Transaction } from "@solana/web3.js";
import { fetchElection, deleteElection } from "../../api/election";

const Elections = () => {
  const [isStartElectionModalOpen, setIsStartElectionModalOpen] =
    createSignal(false);
  const [isUpdateElectionModalOpen, setIsUpdateElectionModalOpen] =
    createSignal(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [globalState, setGlobalState] = useGlobalContext();
  const [search, setSearch] = createSignal("");
  const [page, setPage] = createSignal(1);
  const [limit] = createSignal(10);
  const [activeTab, setActiveTab] = createSignal("DRAFT");
  const [time, setTime] = createSignal(new Date());
  const [election, setElection] = createSignal("");
  const [message, setMessage] = createSignal("");
  const [electionsc, setelectionsc] = createSignal("");
  const [deleteId, setDeleteId] = createSignal("");

  const isValidSolanaPublicKey = (publicKeyString) => {
    try {
      new PublicKey(publicKeyString);
      return true;
    } catch (error) {
      return false;
    }
  };

  const hasFinalize = (publicKey) => {
    console.log(electionsc());
    if (electionsc()) {
      if (isValidSolanaPublicKey(publicKey)) {
        return electionsc()?.filter(
          (x) => x?.publicKey?.toString() === publicKey
        )[0]?.account?.statusSelesai;
      }
    }
    return false;
  };

  const [elections, { refetch }] = createResource(
    () => ({
      token: localStorage.getItem("token") || "",
      search: search(),
      page: page(),
      limit: limit(),
    }),
    async ({ token, search, page, limit }) =>
      await fetchElection(token, search, page, limit)
  );

  createEffect(async () => {
    if (!globalState()?.loading) {
      const data =
        await globalState()?.smartContractProgram?.account?.election?.all();
      setelectionsc(await data);
      console.log(data);
      console.log(globalState()?.user?.email);
      if (!globalState()?.user?.email) navigate("/", { replace: true });
    }
  });

  const delElection = async (id) => {
    try {
      const result = await deleteElection(
        localStorage.getItem("token") || "",
        id
      );
    } catch (error) {}
  };

  const finalize = async (election) => {
    // console.log(
    //   new PublicKey(election.publicKey).toString(),
    //   globalState()?.wallet?.publicKey.toString()
    // );
    // return;
    if (!globalState()?.smartContractProgram) {
      setMessage("Hubungkan ke Wallet Telebih Dahulu!");
      setTimeout(() => {
        setMessage("");
      }, 2000);
      return;
    }

    try {
      const connection = globalState().smartContractProgram.provider.connection;
      const latestBlockhash = await connection.getLatestBlockhash();
      const instruction = await globalState()
        ?.smartContractProgram.methods.finalize()
        .accounts({
          election: new PublicKey(election.publicKey),
          admin: globalState()?.wallet?.publicKey,
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
      setMessage("Berhasil Merubah Status Election/Pemilihan Menjadi Finish!");
    } catch (err) {
      console.log(err);
      setMessage(`Gagal Menambahkan User: ${err.message}`);
    } finally {
      setTimeout(() => {
        setMessage("");
        refetch();
      }, 2000);
    }
  };

  createEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    onCleanup(() => clearInterval(interval));
  });

  setGlobalState({ ...globalState(), function: refetch });

  createEffect(() => {
    setPage(1);
    refetch();
  }, [search, activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value;
    setSearch(searchTerm);
  };

  const whitelistHandle = (e, id, electionName) => {
    e.preventDefault();
    setGlobalState({ ...globalState(), selectedElection: electionName });
    navigate(`/election/whitelist/${id}`, { replace: true });
  };

  return (
    <div class="flex flex-1 h-px my-2 gap-2">
      <Sidebar path={location.pathname}>
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
        <div class="flex flex-col max-h-[77vh] container mx-auto">
          <h1 class="font-semibold text-2xl text-center mt-2">
            DATA PEMILIHAN
            <div class="text-sm text-right font-normal mb-4">
              {time().toLocaleString()}
            </div>
          </h1>
          <div class="flex md:flex-row flex-col md:justify-between md:items-center">
            <div class="md:tabs mb-4 text-xs">
              <button
                class={
                  "btn btn-outline-primary rounded-lg px-4 me-4 " +
                  (globalState()?.user?.access == "ADMIN" ? "" : "hidden")
                }
                onClick={() => {
                  navigate("/election/new", { replace: true });
                }}
              >
                ELECTION BARU
              </button>
              <For each={["DRAFT", "ONGOING", "FINISH"]}>
                {(status) => (
                  <>
                    <input
                      type="radio"
                      id={`tab-${status}`}
                      name="tab-elections"
                      class="tab-toggle"
                      checked={activeTab() === status}
                      onChange={() => {
                        setActiveTab(status);
                        setPage(1);
                      }}
                    />
                    <label for={`tab-${status}`} class="tab tab-bordered px-6 ">
                      {status}
                    </label>
                  </>
                )}
              </For>
            </div>
            <form onSubmit={handleSearch} class="mb-4 flex justify-end">
              <input
                type="text"
                name="search"
                placeholder="Cari - By Nama"
                class="input input-bordered w-full"
              />
              <button type="submit" class="btn btn-primary ml-2">
                Search
              </button>
            </form>
          </div>
          <div class="w-full overflow-auto">
            <table class="table-hover table-compact table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>Organisasi</th>
                  <th>Terakhir Update</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <For each={elections()?.data?.[activeTab()]?.data}>
                  {(election, electionIndex) => (
                    <tr>
                      <td class="p-0">
                        {(page() - 1) * limit() + electionIndex() + 1}
                      </td>
                      <td>{election.name}</td>
                      <td>{election.organization}</td>
                      <td>{new Date(election.updatedAt).toLocaleString()}</td>
                      <td>
                        <div class="flex gap-2">
                          <Show
                            when={!(election.Status === "DRAFT")}
                            fallback={
                              <div class="flex gap-2 items-center">
                                <button
                                  class="btn btn-primary btn-xs"
                                  onClick={() => {
                                    setElection(election);
                                    setIsStartElectionModalOpen(true);
                                  }}
                                >
                                  Mulai Pemilihan
                                </button>
                                <a
                                  href={`${globalState().clienturl}${
                                    location.pathname
                                  }/update/${election.id}`}
                                  class="btn btn-warning btn-xs"
                                >
                                  Edit
                                </a>
                                <div>
                                  <label
                                    class="btn btn-error btn-xs"
                                    for="deleteModal"
                                    onClick={() => {
                                      setDeleteId(election.id);
                                    }}
                                  >
                                    Hapus
                                  </label>
                                </div>
                              </div>
                            }
                          ></Show>
                          <Show
                            when={!(election.Status === "ONGOING")}
                            fallback={
                              <div class="flex gap-2 items-center">
                                <button
                                  class="btn btn-primary btn-xs"
                                  onClick={() => {
                                    setElection(election);
                                    setIsUpdateElectionModalOpen(true);
                                  }}
                                >
                                  Update
                                </button>
                              </div>
                            }
                          ></Show>
                          <Show
                            when={
                              !(election.Status === "ONGOING") &&
                              !(election.Status === "FINISH")
                            }
                            fallback={
                              <div class="flex gap-2 items-center">
                                <a
                                  class="btn btn-secondary btn-xs"
                                  onClick={(e) => {
                                    whitelistHandle(
                                      e,
                                      election.id,
                                      election.name
                                    );
                                  }}
                                >
                                  Whitelist/Vote
                                </a>
                              </div>
                            }
                          ></Show>
                          <a
                            href={`${globalState().clienturl}${
                              location.pathname
                            }/${election.id}`}
                            class="btn btn-success btn-xs"
                          >
                            Detail
                          </a>
                          <Show
                            when={
                              election.Status === "FINISH" &&
                              !hasFinalize(election.publicKey) &&
                              electionsc()
                            }
                          >
                            <button
                              type="button"
                              class={"btn btn-xs"}
                              onClick={() => finalize(election)}
                              // disabled={user?.profile?.publicKey}
                            >
                              Finalisasi
                            </button>
                          </Show>
                        </div>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
          {elections()?.data?.[activeTab()]?.data.length > 0 && (
            <div class="flex justify-end mt-4">
              <div class="join flex gap-2">
                <button
                  class="join-item btn"
                  disabled={page() === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  «
                </button>
                <button class="join-item btn">{page()}</button>
                <button
                  class="join-item btn"
                  disabled={
                    page() === elections()?.data?.[activeTab()]?.meta.totalPages
                  }
                  onClick={() =>
                    setPage((p) =>
                      Math.min(
                        elections()?.data?.[activeTab()]?.meta.totalPages,
                        p + 1
                      )
                    )
                  }
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </Sidebar>
      <input class="modal-state" id="deleteModal" type="checkbox" />
      <div class="modal">
        <label class="modal-overlay" for="deleteModal"></label>
        <div class="modal-content flex flex-col gap-5">
          <label
            for="deleteModal"
            class="btn btn-xs btn-circle btn-ghost absolute right-2 top-2"
          >
            ✕
          </label>
          <h2 class="text-xl">Delete!</h2>
          <span>Apakah Anda Yakin Ingin Mendelete Data Election Ini?</span>
          <div class="flex gap-3">
            <label
              class="btn btn-error btn-block"
              for="deleteModal"
              onClick={async () => {
                await delElection(deleteId());
                await refetch();
              }}
            >
              Delete
            </label>
            <label for="deleteModal" class="btn btn-block">
              Cancel
            </label>
          </div>
        </div>
      </div>
      {isStartElectionModalOpen() && (
        <StartElectionModal
          election={election}
          onClose={() => {
            setIsStartElectionModalOpen(false);
            refetch();
          }}
        />
      )}
      {isUpdateElectionModalOpen() && (
        <UpdateElectionModal
          election={election()}
          onClose={() => {
            setIsUpdateElectionModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default Elections;
