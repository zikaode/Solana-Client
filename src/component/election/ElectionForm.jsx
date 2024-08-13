import { createSignal, createEffect } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { CandidateModal } from "./CandidateModal";
import { SaksiModal } from "./SaksiModal";

export function ElectionForm({
  onOpenCandidateModal,
  onOpenSaksiModal,
  onSuccess,
  onError,
  _candidate,
  _saksi,
  initialData = {},
  isUpdate = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = createSignal(initialData?.name || "");
  const [organization, setOrganization] = createSignal(
    initialData?.organization || ""
  );
  const [description, setDescription] = createSignal(
    initialData?.description || ""
  );
  const [candidates, setCandidates] = createSignal(initialData.candidate || []);
  const [saksi, setSaksi] = createSignal(
    initialData?.saksi?.map((saksi) => saksi.id) || []
  );
  const [showCandidateModal, setShowCandidateModal] = createSignal(false);
  const [showSaksiModal, setShowSaksiModal] = createSignal(false);
  const [loading, setLoading] = createSignal(false);

  const addCandidate = (ketuaId, wakilId) => {
    setCandidates([...candidates(), { ketuaId, wakilId }]);
  };

  const addSaksi = (saksiIds) => {
    setSaksi(saksiIds);
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const data = {
      userData: { access: "ADMIN" },
      name: name(),
      organization: organization(),
      description: description(),
      candidate: candidates(),
      saksi: saksi(),
    };

    try {
      const url = isUpdate
        ? `https://evoting-server.vercel.app/election/draft/${initialData.id}`
        : "https://evoting-server.vercel.app/election";
      const method = isUpdate ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        setName("");
        setOrganization("");
        setDescription("");
        setCandidates([]);
        setSaksi([]);
        onSuccess();
        navigate("/election", { replace: true });
      } else {
        onError(json.message);
      }
    } catch (error) {
      console.error("Error:", error);
      onError();
      setLoading(false);
    }
  };

  createEffect(() => {
    const form = document.querySelector("form");
    if (form) {
      window.addEventListener("addCandidate", (e) => {
        const { ketuaId, wakilId } = e.detail;
        addCandidate(ketuaId, wakilId);
      });

      console.log("test");

      window.addEventListener("addSaksi", (e) => {
        const saksiIds = e.detail;
        addSaksi(saksiIds);
      });

      return () => {
        window.removeEventListener("addCandidate", addCandidate);
        window.removeEventListener("addSaksi", addSaksi);
      };
    }
  });

  return (
    <>
      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium mb-2">
            Nama *
          </label>
          <input
            type="text"
            id="name"
            value={name()}
            onInput={(e) => setName(e.target.value)}
            class="input input-block"
            placeholder=""
            required
          />
        </div>
        <div>
          <label for="organization" class="block text-sm font-medium mb-2">
            Organisasi *
          </label>
          <input
            type="text"
            id="organization"
            value={organization()}
            onInput={(e) => setOrganization(e.target.value)}
            class="input input-block"
            placeholder=""
            required
          />
        </div>
        <div>
          <label for="description" class="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description()}
            onInput={(e) => setDescription(e.target.value)}
            class="textarea textarea-block"
            placeholder=""
          ></textarea>
        </div>
        <div>
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-lg font-medium mb-2">Candidates *</h3>
            <button
              type="button"
              onClick={() => setShowCandidateModal(true)}
              class="btn btn-primary mt-2"
            >
              Tambah Kandidat
            </button>
          </div>
          {candidates().length > 0 ? (
            <div class="flex w-full overflow-x-auto">
              <table class="table-zebra table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Ketua</th>
                    <th>Wakil</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates().map((c, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <div class="flex gap-2 items-center">
                          <img
                            src={
                              _candidate.find((u) => u.id === c.ketuaId)
                                ?.profile?.image
                            }
                            alt="Profile"
                            class="avatar avatar-ring avatar-xl"
                          />
                          <span>{`${
                            _candidate.find((u) => u.id === c.ketuaId)?.name
                          } (${
                            _candidate.find((u) => u.id === c.ketuaId)?.profile
                              ?.nim
                          })`}</span>
                        </div>
                      </td>
                      <td>
                        <div class="flex gap-2 items-center">
                          <img
                            src={
                              _candidate.find((u) => u.id === c.wakilId)
                                ?.profile?.image
                            }
                            alt="Profile"
                            class="avatar avatar-ring avatar-xl"
                          />
                          <span>{`${
                            _candidate.find((u) => u.id === c.wakilId)?.name
                          } (${
                            _candidate.find((u) => u.id === c.wakilId)?.profile
                              ?.nim
                          })`}</span>
                        </div>
                      </td>
                      <td>
                        <button
                          class="btn btn-error"
                          onClick={() => {
                            setCandidates(
                              candidates().filter((_, i) => i !== index)
                            );
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p class="text-sm text-gray-500">Belum Ada Kandidat</p>
          )}
        </div>
        <div>
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-lg font-medium mb-2">Saksi</h3>
            <button
              type="button"
              onClick={() => setShowSaksiModal(true)}
              class="btn btn-primary mt-2"
            >
              Tambah Saksi
            </button>
          </div>

          {saksi().length > 0 ? (
            <div class="flex w-full overflow-x-auto">
              <table class="table-zebra table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Saksi</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {saksi().map((s, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <div class="flex gap-2 items-center">
                          <img
                            src={_saksi.find((u) => u.id === s)?.profile?.image}
                            alt="Profile"
                            class="avatar avatar-ring avatar-xl"
                          />
                          <span>{`${_saksi.find((u) => u.id === s)?.name} (${
                            _saksi.find((u) => u.id === s)?.profile?.nim
                          })`}</span>
                        </div>
                      </td>
                      <td>
                        <button
                          class="btn btn-error"
                          onClick={() => {
                            setSaksi(saksi().filter((_, i) => i !== index));
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p class="text-sm text-gray-500">Belum Ada Saksi.</p>
          )}
        </div>
        <div class="flex justify-end">
          <button
            type="submit"
            class={"btn btn-success " + (loading() && "btn-loading")}
          >
            {isUpdate ? "Update Pemilihan" : "Buat Pemilihan Baru"}
          </button>
        </div>
      </form>
      {showCandidateModal() && (
        <CandidateModal
          users={_candidate}
          selectedCandidatesProp={candidates()}
          onClose={() => setShowCandidateModal(false)}
        />
      )}
      {showSaksiModal() && (
        <SaksiModal
          users={_saksi}
          selectedSaksiProp={saksi()}
          onClose={() => setShowSaksiModal(false)}
        />
      )}
    </>
  );
}
