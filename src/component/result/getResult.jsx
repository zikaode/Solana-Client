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
  const [activeTab, setActiveTab] = createSignal("FINISH");
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
      console.log(elections());
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
            HASIL PEMILIHAN
            <div class="text-sm text-right font-normal mb-4">
              {time().toLocaleString()}
            </div>
          </h1>
          <div class="flex md:flex-row flex-col md:justify-between md:items-center">
            <div class="md:tabs mb-4 text-xs"></div>
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

          <div class="w-full overflow-auto flex flex-col gap-4">
            {elections.loading ? (
              <div class="text-center">LOADING...</div>
            ) : elections()?.data?.[activeTab()]?.data ? (
              <></>
            ) : (
              <div class="text-center">TIDAK ADA DATA</div>
            )}
            <For each={elections()?.data?.[activeTab()]?.data}>
              {(election, electionIndex) => (
                <>
                  <div class="bg-slate-50 text-black px-4 py-2 rounded-md flex flex-col gap-2">
                    <div class="flex justify-between text-xs">
                      <div>{election.organization}</div>
                      <div>{`Last Updated: ${new Date(
                        election.updatedAt
                      ).toLocaleString()}`}</div>
                    </div>
                    <div class="flex justify-between items-center">
                      <div class="text-xl font-bold">{election.name}</div>
                      <div class="text-xs">
                        {`${
                          election.whitelists.filter((x) => x.ballot).length
                        } Orang Memilih Dari `}
                        {`${election.whitelists.length} Yang Mendaftar!`}
                      </div>
                    </div>
                    <div class="flex gap-2 justify-start">
                      <For each={election.candidate}>
                        {(candidate, candidateIndex) => (
                          <>
                            <div class="flex flex-row gap-4 bg-slate-400 p-2 rounded-md px-4 w-1/2 justify-center">
                              <div class="flex justify-center items-start text-lg font-bold text-white">
                                {candidateIndex() + 1}
                              </div>
                              <div class="flex flex-col justify-center gap-2">
                                <div class="avatar avatar-ring h-32 w-32 object-contain">
                                  <img src={candidate.ketua.profile.image} />
                                </div>
                                <div class="text-center">
                                  {candidate.ketua.name}
                                </div>
                              </div>
                              <div class="flex flex-col justify-center gap-2 object-top">
                                <div class="avatar avatar-ring h-32 w-32">
                                  <img src={candidate.wakil.profile.image} />
                                </div>
                                <div class="text-center">
                                  {candidate.wakil.name}
                                </div>
                              </div>
                              <div class="bg-white rounded-md flex items-end">
                                <div
                                  class="w-1 bg-green-600 rounded-md"
                                  style={`height: ${
                                    (election.whitelists.filter(
                                      (x) => x.ballot?.voteId == candidate.id
                                    ).length /
                                      election.whitelists.length) *
                                    100
                                  }%`}
                                ></div>
                              </div>
                              <div class="flex items-end">
                                <div class="text-xs">
                                  {`${(
                                    (election.whitelists.filter(
                                      (x) => x.ballot?.voteId == candidate.id
                                    ).length /
                                      election.whitelists.length) *
                                    100
                                  ).toFixed(1)}%`}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </For>
                    </div>
                    <div class="flex justify-between">
                      <div class="flex justify-center items-center gap-2">
                        <span class="text-xs">SAKSI: </span>
                        <For each={election.saksi}>
                          {(saksi, saksiIndex) => (
                            <>
                              <div class="avatar avatar-ring">
                                <img src={saksi.profile.image} />
                              </div>
                            </>
                          )}
                        </For>
                      </div>
                      <a
                        href={`/result/${election.id}`}
                        class="btn btn-outline-secondary"
                      >
                        {" "}
                        Detail
                      </a>
                    </div>
                  </div>
                </>
              )}
            </For>
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
