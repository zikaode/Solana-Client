import {
  createSignal,
  createEffect,
  createResource,
  For,
  onCleanup,
  Suspense,
} from "solid-js";
import { useLocation, useNavigate, useParams } from "@solidjs/router";
import { useGlobalContext } from "../../context/globalContext";
import { WhitelistModal } from "./whitelistModal";
import Sidebar from "../template/sidebar";

const whitelistUpdate = () => {
  const [whitelist, setWhitelist] = createSignal([]);
  const [activeTab, setActiveTab] = createSignal("PENDING");
  const [isOpenProfile, setIsOpenProfile] = createSignal(false);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [globalState, setGlobalState] = useGlobalContext();
  const [page, setPage] = createSignal(1);
  const [limit] = createSignal(10);
  const [search, setSearch] = createSignal("");
  const [time, setTime] = createSignal(new Date());

  const navigate = useNavigate();
  const location = useLocation();
  // Fetch data from API
  const params = useParams();

  const [whitelists, { refetch }] = createResource(
    () => ({
      token: localStorage.getItem("token") || "",
      id: params.id,
      search: search(),
      page: page(),
      limit: limit(),
    }),
    async ({ id, token, search, page, limit }) => {
      const response = await fetch(
        `https://evoting-server.vercel.app/whitelist/${id}` +
          `?search=${search}&page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.json();
    }
  );

  createEffect(() => {
    if (!globalState()?.loading) {
      console.log(globalState()?.user?.email);
      if (!globalState()?.user?.email) navigate("/", { replace: true });
    }
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

  createEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    onCleanup(() => clearInterval(interval));
  });

  const whitelistHandle = async () => {
    try {
      setErrorMessage([]);
      const response = await fetch(
        "https://evoting-server.vercel.app/whitelist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({
            address: globalState().user?.profile.address,
            id: election().Data?.id,
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setErrorMessage([]);
        setSuccessMessage(data.message);
      } else {
        const { errors } = await response.json();
        setErrorMessage([...errorMessage(), ...errors]);
      }
    } catch (error) {
      setErrorMessage([{ msg: "Error While Update Profile" }]);
    } finally {
      setTimeout(() => {
        setErrorMessage([]);
        setSuccessMessage("");
      }, 2500);
    }
  };

  return (
    <div class="flex flex-1 h-px my-2 gap-2">
      <Sidebar path={location.pathname}>
        <div class="flex flex-col max-h-[77vh] container mx-auto">
          <h1 class="font-semibold text-2xl text-center mt-2 relative">
            <button
              class="absolute left-0"
              onClick={() => {
                navigate("/election", { replace: true });
              }}
            >
              <img
                width="50"
                height="50"
                src="https://img.icons8.com/ios/50/circled-left-2.png"
                alt="circled-left-2"
                class="w-8 invert hover:bg-yellow-700 rounded-full"
              />
            </button>{" "}
            <div class="mb-4">DAFTAR WHITELIST</div> "
            {globalState().selectedElection}"
            <div class="text-sm text-right font-normal mb-4">
              {time().toLocaleString()}
            </div>
          </h1>
          <div class="p-4">
            <div class="flex md:flex-row flex-col md:justify-between md:items-center">
              <div class="md:tabs mb-4 text-xs">
                <For each={["PENDING", "ACCEPT", "DECLINE"]}>
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
                      <label
                        for={`tab-${status}`}
                        class="tab tab-bordered px-6 "
                      >
                        {`${
                          status == "ACCEPT"
                            ? "DITERIMA"
                            : status == "DECLINE"
                            ? "DITOLAK"
                            : "BELUM DIREVIEW"
                        }`}
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
                    <th>Status Vote</th>
                    <th>Nama</th>
                    <th>NIM</th>
                    <th>Jurusan</th>
                    <th>Prodi</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={whitelists()?.data?.[activeTab()]?.data}>
                    {(whitelist, whitelistIndex) => (
                      <tr>
                        {/* {console.log(whitelist)} */}
                        <td class="p-0">
                          {(page() - 1) * limit() + whitelistIndex() + 1}
                        </td>
                        <td>
                          <span
                            class={`badge px-2 badge-xs ${
                              whitelist?.ballot
                                ? whitelist?.ballot?.isvalid
                                  ? "badge-success"
                                  : "badge-error"
                                : "badge-primary"
                            }`}
                          >
                            {`${
                              whitelist?.ballot
                                ? whitelist?.ballot?.isvalid
                                  ? "Telah Memilih"
                                  : "Tidak Valid"
                                : "Belum/Tidak Memilih"
                            }`}
                          </span>
                        </td>
                        <td>{whitelist.user.name}</td>
                        <td>{whitelist.user.profile.nim}</td>
                        <td>{whitelist.user.profile.jurusan}</td>
                        <td>
                          {whitelist.user.profile.prodi.replace("_", " ")}
                        </td>
                        <td class="flex flex-row gap-2 justify-left items-center">
                          <Show
                            when={activeTab() === "PENDING"}
                            class={activeTab() === "PENDING" ? "" : "hidden"}
                          >
                            <div>
                              <button
                                class="px-4 py-2 btn text-white rounded-md btn-xs btn-primary"
                                onClick={() => setIsModalOpen(true)}
                              >
                                Ubah Status Whitelist
                              </button>
                              {isModalOpen() && (
                                <WhitelistModal
                                  dataWhitelist={whitelist}
                                  onClose={() => {
                                    setIsModalOpen(false);
                                    refetch();
                                  }}
                                />
                              )}
                            </div>
                          </Show>
                          <Show
                            when={
                              whitelist?.user.profile &&
                              !whitelist?.user.profile.isTerminate
                            }
                          >
                            <div>
                              <label
                                className="btn btn-warning btn-xs"
                                htmlFor={`modal-profile-${whitelist?.user.id}`}
                                onClick={() => setIsOpenProfile(true)}
                              >
                                Profil
                              </label>
                              <input
                                className="modal-state"
                                id={`modal-profile-${whitelist?.user.id}`}
                                type="checkbox"
                              />
                              <div className="modal w-screen">
                                <label
                                  className="modal-overlay"
                                  htmlFor={`modal-profile-${whitelist?.user.id}`}
                                ></label>
                                <div className="modal-content flex flex-col gap-5 max-w-screen-md">
                                  <h2 className="text-xl p-4 text-center">
                                    {whitelist?.user.name}{" "}
                                    {`(${whitelist?.user.email})`}
                                  </h2>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="font-semibold">NIM:</p>
                                      <p>{whitelist?.user.profile.nim}</p>
                                    </div>
                                    <div>
                                      <p className="font-semibold">Jurusan:</p>
                                      <p>
                                        {whitelist?.user.profile.jurusan.replace(
                                          /_/g,
                                          " "
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-semibold">Prodi:</p>
                                      <p>
                                        {whitelist?.user.profile.prodi.replace(
                                          /_/g,
                                          " "
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-semibold">Wallet:</p>
                                      <p>{whitelist?.user.profile.address}</p>
                                    </div>
                                  </div>
                                  <div class="flex gap-4">
                                    <div className="flex-1 h-max">
                                      <p className="font-semibold mb-2">
                                        Gambar Profil:
                                      </p>
                                      <img
                                        src={whitelist?.user.profile.image}
                                        alt="Profile"
                                        class="w-full rounded-lg object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 h-max">
                                      <p className="font-semibold mb-2">
                                        Gambar KTM:
                                      </p>
                                      <img
                                        src={whitelist?.user.profile.imageKTM}
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
                                          `modal-profile-${whitelist?.user.id}`
                                        ).checked = false)
                                      }
                                    >
                                      Close
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Show>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
              {whitelists.loading ? (
                <div class="w-full text-center mt-2">LOADING...</div>
              ) : whitelists()?.data?.[activeTab()]?.data.length > 0 ? (
                ""
              ) : (
                <div class="w-full text-center mt-2">TIDAK ADA DATA</div>
              )}
            </div>
            {whitelists()?.data?.[activeTab()]?.data?.length > 0 && (
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
                      page() ===
                      whitelists()?.data?.[activeTab()]?.meta?.totalPages
                    }
                    onClick={() =>
                      setPage((p) =>
                        Math.min(
                          whitelists()?.data?.[activeTab()]?.meta?.totalPages,
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
        </div>
      </Sidebar>
    </div>
  );
};

export default whitelistUpdate;
