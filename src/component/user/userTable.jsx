import {
  For,
  createSignal,
  createResource,
  createEffect,
  onCleanup,
  Show,
} from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import Sidebar from "../template/sidebar";
import ActionModal from "./actionModal";
import { useGlobalContext } from "../../context/globalContext";
import { web3 } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { userInit } from "../../api/profile";

function isValidSolanaPublicKey(publicKeyString) {
  try {
    new PublicKey(publicKeyString);
    return true;
  } catch (error) {
    return false;
  }
}

const fetchUsers = async (search, page, limit) => {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(
    `https://evoting-server.vercel.app/user/?search=${search}&page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.json();
};

const UserTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [globalState, setGlobalState] = useGlobalContext();
  const [search, setSearch] = createSignal("");
  const [page, setPage] = createSignal(1);
  const [limit] = createSignal(10);
  const [activeTab, setActiveTab] = createSignal("USER");
  const [time, setTime] = createSignal(new Date());
  const [isOpenProfile, setIsOpenProfile] = createSignal(false);
  const [message, setMessage] = createSignal("");

  const [users, { refetch }] = createResource(
    () => ({ search: search(), page: page(), limit: limit() }),
    ({ search, page, limit }) => fetchUsers(search, page, limit)
  );

  createEffect(() => {
    if (!globalState()?.loading) {
      console.log(globalState()?.user?.email);
      if (!globalState()?.user?.email) navigate("/", { replace: true });
    }
  });

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

  const addUser = async (user, profileComplate) => {
    if (!globalState()?.smartContractProgram) {
      setMessage("Hubungkan ke Wallet Telebih Dahulu!");
      setTimeout(() => {
        setMessage("");
      }, 2000);
      return;
    }
    if (profileComplate) {
      setMessage("Lengkapi Profile User Ini Terlebih Dahulu!");
      setTimeout(() => {
        setMessage("");
      }, 2000);
      return;
    }
    if (
      globalState()?.smartContractProgram?.account?.user?.fetch(
        user?.profile?.publicKey
      ) &&
      isValidSolanaPublicKey(user?.profile?.publicKey)
    ) {
      setMessage("User Ini telah Di Daftarkan Pada SmartContract!");
      setTimeout(() => {
        setMessage("");
      }, 2000);
      return;
    }
    console.log(
      message(),
      await globalState()?.smartContractProgram?.account?.user?.all(),
      globalState()?.wallet?.publicKey,
      user
    );
    try {
      console.log(globalState()?.smartContractProgram);
      const userAccount = web3.Keypair.generate();
      await globalState()
        ?.smartContractProgram.methods.addUser(
          user.profile.nim,
          user.name,
          user.email,
          user.profile.prodi,
          user.profile.jurusan,
          false
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
        user.id,
        userAccount.publicKey
      );
      setMessage("User added successfully!");
      setTimeout(() => {
        setMessage("");
        refetch();
      }, 2000);
    } catch (err) {
      console.log(err);
      setMessage(`Error adding user: ${err.message}`);
      setTimeout(() => {
        setMessage("");
        refetch();
      }, 2000);
    }
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
            DATA PENGGUNA
            <div class="text-sm text-right font-normal mb-4">
              {time().toLocaleString()}
            </div>
          </h1>
          <div class="flex md:flex-row flex-col md:justify-between md:items-center">
            <div class="md:tabs mb-4 text-xs">
              <For each={["USER", "CANDIDATE", "SAKSI", "TERMINATE"]}>
                {(access) => (
                  <>
                    <input
                      type="radio"
                      id={`tab-${access}`}
                      name="tab-users"
                      class="tab-toggle"
                      checked={activeTab() === access}
                      onChange={() => {
                        setActiveTab(access);
                        setPage(1);
                      }}
                    />
                    <label for={`tab-${access}`} class="tab tab-bordered px-6 ">
                      {access == "CANDIDATE"
                        ? "KANDIDAT"
                        : access == "TERMINATE"
                        ? "DI-BLOKIR"
                        : access}
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
                  <th>Foto</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <For each={users()?.[activeTab()].data}>
                  {(user, userIndex) => (
                    <tr>
                      <th class="p-0">
                        {(page() - 1) * limit() + userIndex() + 1}
                      </th>
                      <td>
                        <img
                          src={
                            user?.profile?.image
                              ? user?.profile?.image
                              : "public/images/avatar-svgrepo-com.svg"
                          }
                          alt="Profile Image"
                          class="avatar-ring avatar-md avatar object-cover"
                        />
                      </td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td class="flex gap-2 items-center">
                        <ActionModal user={user} class="h-full" />
                        <Show when={user.profile && !user.profile.isTerminate}>
                          <label
                            className="btn btn-primary btn-xs"
                            htmlFor={`modal-profile-${user.id}`}
                            onClick={() => setIsOpenProfile(true)}
                          >
                            Profil
                          </label>
                          <input
                            className="modal-state"
                            id={`modal-profile-${user.id}`}
                            type="checkbox"
                          />
                          <div className="modal w-screen">
                            <label
                              className="modal-overlay"
                              htmlFor={`modal-profile-${user.id}`}
                            ></label>
                            <div className="modal-content flex flex-col gap-5 max-w-screen-md">
                              <h2 className="text-xl p-4 text-center">
                                {user.name}
                              </h2>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="font-semibold">NIM:</p>
                                  <p>{user.profile.nim}</p>
                                </div>
                                <div>
                                  <p className="font-semibold">Jurusan:</p>
                                  <p>
                                    {user.profile.jurusan.replace(/_/g, " ")}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-semibold">Prodi:</p>
                                  <p>{user.profile.prodi.replace(/_/g, " ")}</p>
                                </div>
                                <div>
                                  <p className="font-semibold">
                                    Wallet Address:
                                  </p>
                                  <p>{user.profile.address}</p>
                                </div>
                              </div>
                              <div class="flex gap-4">
                                <div className="flex-1 h-max">
                                  <p className="font-semibold mb-2">Image:</p>
                                  <img
                                    src={user.profile.image}
                                    alt="Profile"
                                    class="w-full rounded-lg object-cover"
                                  />
                                </div>
                                <div className="flex-1 h-max">
                                  <p className="font-semibold mb-2">
                                    KTM Image:
                                  </p>
                                  <img
                                    src={user.profile.imageKTM}
                                    alt="KTM"
                                    class="w-full rounded-lg object-contain"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-3 justify-end">
                                <button
                                  className="btn"
                                  onClick={() =>
                                    (document.getElementById(
                                      `modal-profile-${user.id}`
                                    ).checked = false)
                                  }
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          </div>
                        </Show>
                        <Show when={user?.access != "USER"}>
                          <button
                            type="button"
                            class={
                              "btn btn-xs " +
                              (user?.profile?.publicKey != null &&
                              user?.profile &&
                              !user?.profile?.isTerminate
                                ? "btn-success"
                                : "btn-warning")
                            }
                            onClick={() => addUser(user, !user?.profile)}
                            disabled={user?.profile?.publicKey}
                          >
                            {user?.profile?.publicKey
                              ? "Telah Terdaftar"
                              : "Daftar ke SmartContract"}
                          </button>
                        </Show>
                      </td>
                    </tr>
                  )}
                </For>{" "}
              </tbody>
            </table>
            {users.loading ? (
              <div class="w-full text-center mt-2">LOADING...</div>
            ) : users()?.[activeTab()].data.length > 0 ? (
              ""
            ) : (
              <div class="w-full text-center mt-2">TIDAK ADA DATA</div>
            )}
          </div>
          {users()?.[activeTab()].data.length > 0 && (
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
                  disabled={page() === users()[activeTab()].meta.totalPages}
                  onClick={() =>
                    setPage((p) =>
                      Math.min(users()[activeTab()].meta.totalPages, p + 1)
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
    </div>
  );
};

export default UserTable;
