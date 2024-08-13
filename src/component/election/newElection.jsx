// App.jsx
import {
  createSignal,
  createResource,
  createEffect,
  onCleanup,
  Suspense,
  Show,
} from "solid-js";
import { useLocation, useNavigate, useParams } from "@solidjs/router";
import { useGlobalContext } from "../../context/globalContext";
import { ElectionForm } from "./ElectionForm";
import { CandidateModal } from "./CandidateModal";
import Sidebar from "../template/sidebar";
import { SaksiModal } from "./SaksiModal";
import { Toast } from "./Toast";

const fetchUsers = async () => {
  const res = await fetch("https://evoting-server.vercel.app/user", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
  });
  return res.json();
};

const fetchElectionDetails = async (id) => {
  const res = await fetch(`https://evoting-server.vercel.app/election/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
  });
  return res.json();
};

function newElection() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const isUpdate = !params.id;
  const [globalState, setGlobalState] = useGlobalContext();
  const [users] = createResource(fetchUsers);
  const [electionDetails] = createResource(() =>
    isUpdate ? fetchElectionDetails(params.id) : {}
  );
  const [showCandidateModal, setShowCandidateModal] = createSignal(false);
  const [showSaksiModal, setShowSaksiModal] = createSignal(false);
  const [time, setTime] = createSignal(new Date());
  const [toastMessage, setToastMessage] = createSignal("");

  createEffect(() => {
    if (!globalState()?.loading) {
      if (!globalState()?.user?.email) navigate("/", { replace: true });
    }
  });

  createEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    onCleanup(() => clearInterval(interval));
  });

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <div class="flex flex-1 h-px my-2 gap-2">
      <Sidebar path={location.pathname}>
        <Suspense fallback={<div>Loading...</div>}>
          <Show when={users() && (!isUpdate || electionDetails())}>
            {console.log(electionDetails().Data)}
            <div class="container mx-auto p-4">
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
                {isUpdate ? "UPDATE PEMILIHAN" : "BUAT PEMILIHAN BARU"}
                <div class="text-sm text-right font-normal mb-4">
                  {time().toLocaleString()}
                </div>
              </h1>
              <ElectionForm
                onOpenCandidateModal={() => setShowCandidateModal(true)}
                onOpenSaksiModal={() => setShowSaksiModal(true)}
                onSuccess={() =>
                  showToast(
                    `Pemilihan ${
                      isUpdate ? "diupdate" : "dibuat"
                    } Dengan Sukses!`
                  )
                }
                onError={(message) => showToast(message || "Terjadi Error")}
                _candidate={users()?.CANDIDATE?.data.filter(
                  (x) => x?.profile?.publicKey != null
                )}
                _saksi={users()?.SAKSI?.data.filter(
                  (x) => x?.profile?.publicKey != null
                )}
                initialData={isUpdate ? electionDetails()?.Data : {}}
                isUpdate={isUpdate}
              />
              {showCandidateModal() && (
                <CandidateModal
                  users={users()?.CANDIDATE?.data || []}
                  onClose={() => setShowCandidateModal(false)}
                />
              )}
              {showSaksiModal() && (
                <SaksiModal
                  users={users()?.SAKSI?.data || []}
                  onClose={() => setShowSaksiModal(false)}
                />
              )}
              <Toast message={toastMessage()} />
            </div>
          </Show>
        </Suspense>{" "}
      </Sidebar>
    </div>
  );
}

export default newElection;
