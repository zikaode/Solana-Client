import {
  For,
  createSignal,
  createResource,
  createEffect,
  onCleanup,
  onMount,
} from "solid-js";
import { useLocation, useNavigate, useParams } from "@solidjs/router";
import Sidebar from "./template/sidebar";
// import ActionModal from "./actionModal";
import { useGlobalContext } from "../context/globalContext";
import { fetchElection } from "../api/election";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [globalState, setGlobalState] = useGlobalContext();
  const [limit] = createSignal(5);
  const [time, setTime] = createSignal(new Date());

  const [elections, { refetch }] = createResource(
    () => ({
      token: localStorage.getItem("token") || "",
      search: "",
      page: 1,
      limit: limit(),
    }),
    async ({ token, search, page, limit }) =>
      await fetchElection(token, search, page, limit)
  );

  onMount(() => {
    setGlobalState({ ...globalState(), route: "/dashboard" });
  });

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

  return (
    <div class="flex flex-1 h-px my-2 gap-2">
      <Sidebar path={location.pathname}>
        <div class="flex flex-col max-h-full container mx-auto">
          <h1 class="font-semibold text-2xl text-center mt-2">
            HALAMAN UTAMA
            <div class="text-sm text-right font-normal mb-4">
              {time().toLocaleString()}
            </div>
          </h1>
          <div class="flex justify-center items-center bg-slate-800 rounded mb-5">
            <div class="w-10/12 min-h-max">
              <div class="card min-w-full bg-transparent">
                <div class="card-body">
                  <h1 class="card-header">Status</h1>
                  <p class="text-content2">
                    {globalState().user?.name} - ({globalState().user?.email})
                  </p>
                  {/* <p class="text-content2">{globalState().user?.profile.nim}</p> */}
                  <div class="flex gap-2 flex-col md:flex-row max-w-full">
                    {globalState()?.user?.profile &&
                    globalState()?.user?.profile?.imageKTM &&
                    globalState()?.user?.profile?.address ? (
                      <span class="badge rounded-sm badge-lg badge-success text-wrap">
                        Profile - Lengkap
                      </span>
                    ) : (
                      <span class="badge rounded-sm badge-lg badge-error text-wrap">
                        Profile - Belum Lengkap
                      </span>
                    )}
                    {globalState()?.wallet ? (
                      <span class="badge rounded-sm badge-lg badge-success text-wrap">
                        Wallet - Terhubung
                      </span>
                    ) : (
                      <span class="badge rounded-sm badge-lg badge-error text-wrap">
                        Wallet - Tidak Terhubung
                      </span>
                    )}
                  </div>
                  <div class="text-sm text-slate-300">
                    {`${
                      globalState()?.wallet?.publicKey?.toString()
                        ? `Wallet Address - ${globalState()?.wallet?.publicKey?.toString()}`
                        : `Last Wallet Address - ${
                            globalState().user?.profile?.address
                          }`
                    }`}
                  </div>
                  {/* <div class="card-footer">
                    <button class="btn-secondary btn">Learn More</button>
                  </div> */}
                </div>
              </div>
            </div>
            <div class="w-3/12 lg:w-2/12 p-2 rounded h-full hidden lg:flex">
              <img
                src={
                  globalState().user?.profile?.image
                    ? globalState().user?.profile?.image
                    : `/public/images/avatar-svgrepo-com.svg`
                }
                alt="IMAGE"
                class="avatar-squared object-cover"
              />
            </div>
          </div>
          <h2 class="font-semibold text-center mb-5">PEMILIHAN BERLANGSUNG</h2>
          {!elections()?.data?.["ONGOING"] ? (
            <h3 class="text-center text-sm">TIDAK ADA</h3>
          ) : (
            ""
          )}
          <For each={elections()?.data?.["ONGOING"]?.data}>
            {(election, electionIndex) => (
              <div class="card bg-slate-800 rounded mb-5 min-w-full relative">
                <div class="py-2 px-5 flex justify-between items-center">
                  <div class="text-lg text-wrap">
                    <span class="">{`${electionIndex() + 1}.`}</span>{" "}
                    {election?.name}{" "}
                    <span class="text-sm font-extralight">
                      ({election?.organization})
                    </span>
                  </div>
                  <div class="flex gap-2 items-center">
                    {election?.whitelists?.find(
                      (x) => x?.userId == globalState()?.user?.id
                    ) ? (
                      <span class="badge badge-outline-success text-wrap">
                        Telah Terdaftar -{" "}
                        {
                          election?.whitelists?.find(
                            (x) => x?.userId == globalState()?.user?.id
                          ).status
                        }
                      </span>
                    ) : (
                      <span class="badge badge-error text-wrap">
                        Belum/Tidak Terdaftar
                      </span>
                    )}
                    <a
                      href={`/election-vote/${election.id}`}
                      class="btn btn-primary btn-sm"
                    >
                      Detail
                    </a>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </Sidebar>
    </div>
  );
};

export default Dashboard;
