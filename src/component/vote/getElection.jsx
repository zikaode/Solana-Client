import {
  For,
  createSignal,
  createResource,
  createEffect,
  onCleanup,
} from "solid-js";
import { useLocation, useNavigate, useParams } from "@solidjs/router";
import Sidebar from "../template/sidebar";
// import ActionModal from "./actionModal";
import { useGlobalContext } from "../../context/globalContext";
import { fetchElection } from "../../api/election";

const Elections = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [globalState, setGlobalState] = useGlobalContext();
  const [search, setSearch] = createSignal("");
  const [page, setPage] = createSignal(1);
  const [limit] = createSignal(10);
  const [activeTab, setActiveTab] = createSignal("ONGOING");
  const [time, setTime] = createSignal(new Date());

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
    setPage(1); // Reset to first page when search changes
    refetch(); // Refetch data when search or tab changes
  }, [search, activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value;
    setSearch(searchTerm);
  };

  return (
    <div class="flex flex-1 h-px my-2 gap-2">
      <Sidebar path={location.pathname}>
        <div class="flex flex-col max-h-[77vh] container mx-auto">
          <h1 class="font-semibold text-2xl text-center mt-2">
            VOTING
            <div class="text-sm text-right font-normal mb-4">
              {time().toLocaleString()}
            </div>
          </h1>
          <div class="flex md:flex-row flex-col md:justify-between md:items-center">
            <div class="md:tabs mb-4 text-xs">
              <For each={["ONGOING", "FINISH"]}>
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
                  <th>
                    {activeTab() == "ONGOING"
                      ? "Status Whitelist"
                      : "Status Voting"}
                  </th>
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
                      <td>
                        <span class="badge badge-primary px-2 badge-xs">
                          {`${
                            election?.whitelists[
                              election?.whitelists.findIndex(
                                (x) => x?.userId === globalState()?.user?.id
                              )
                            ]?.ballot?.isvalid
                              ? "Telah Memilih"
                              : election?.whitelists[
                                  election?.whitelists.findIndex(
                                    (x) => x?.userId === globalState()?.user?.id
                                  )
                                ]?.status || "Tidak/Belum Terdaftar"
                          }`}
                        </span>
                      </td>
                      <td>{election.name}</td>
                      <td>{election.organization}</td>
                      <td>{new Date(election.updatedAt).toLocaleString()}</td>
                      <td>
                        <a
                          href={`${globalState().clienturl}${
                            location.pathname
                          }/${election.id}`}
                          class="btn btn-success btn-sm"
                        >
                          Detail
                        </a>
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
    </div>
  );
};

export default Elections;
