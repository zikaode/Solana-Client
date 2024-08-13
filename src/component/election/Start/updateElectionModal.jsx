import { createSignal } from "solid-js";

export function UpdateElectionModal({ election, onClose }) {
  const formatISOToDateTimeLocal = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const pad = (num) => String(num).padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Months are zero-based
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [voteStart, setVoteStart] = createSignal(
    formatISOToDateTimeLocal(election.voteStart)
  );
  const [voteEnd, setVoteEnd] = createSignal(
    formatISOToDateTimeLocal(election.voteEnd)
  );
  const [whiteliststart, setWhitelistStart] = createSignal(
    formatISOToDateTimeLocal(election.whitelistStart)
  );
  const [whitelistEnd, setWhitelistEnd] = createSignal(
    formatISOToDateTimeLocal(election.whitelistEnd)
  );
  const [description, setDescription] = createSignal(election.description);

  const handleUpdateElection = async () => {
    const serverUrl = "https://evoting-server.vercel.app/election";

    const response = await fetch(`${serverUrl}/ongoing/${election.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify({
        voteStart: new Date(voteStart()).toISOString(),
        voteEnd: new Date(voteEnd()).toISOString(),
        whitelistStart: new Date(whiteliststart()).toISOString(),
        whitelistEnd: new Date(whitelistEnd()).toISOString(),
        description: description(),
      }),
    });

    if (response.ok) {
      alert("Election successfully Updated!");
      onClose();
    } else {
      const errorData = await response.json();
      alert(
        "Failed to Update election: " + errorData.errors || errorData.message
      );
    }
  };

  return (
    <>
      <input
        class="modal-state"
        id="start-election-modal"
        type="checkbox"
        checked
      />
      <div class="modal w-full">
        <label
          class="modal-overlay"
          for="start-election-modal"
          onClick={onClose}
        ></label>
        <div class="modal-content flex flex-col gap-5 w-full">
          <label
            for="start-election-modal"
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </label>
          <h2 class="text-xl text-center">Update Pemilihan</h2>

          <div>
            <label
              for="whiteliststart"
              class="block text-sm font-medium text-gray-700"
            >
              Jadwal Mulai Whitelist
            </label>
            <input
              id="whiteliststart"
              type="datetime-local"
              value={whiteliststart()}
              onInput={(e) => setWhitelistStart(e.target.value)}
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-2 py-1 text-base"
              required
            />
          </div>
          <div>
            <label
              for="whiteliststart"
              class="block text-sm font-medium text-gray-700"
            >
              Jadwal Berakhir Whitelist (Jam)
            </label>
            <input
              id="whiteliststart"
              type="datetime-local"
              value={whitelistEnd()}
              onInput={(e) => setWhitelistEnd(e.target.value)}
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-2 py-1 text-base"
              required
            />
          </div>
          <div>
            <label
              for="whiteliststart"
              class="block text-sm font-medium text-gray-700"
            >
              Waktu Tunggu (Jam)
            </label>
            <input
              id="whiteliststart"
              type="datetime-local"
              value={voteStart()}
              onInput={(e) => setVoteStart(e.target.value)}
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-2 py-1 text-base"
              required
            />
          </div>
          <div>
            <label
              for="whiteliststart"
              class="block text-sm font-medium text-gray-700"
            >
              Lamanya Masa Voting (Jam)
            </label>
            <input
              id="whiteliststart"
              type="datetime-local"
              value={voteEnd()}
              onInput={(e) => setVoteEnd(e.target.value)}
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-2 py-1 text-base"
              required
            />
          </div>
          <div>
            <label for="description" class="block text-sm font-medium mb-2">
              Deskripsi
            </label>
            <textarea
              id="description"
              value={description()}
              onInput={(e) => setDescription(e.target.value)}
              class="textarea textarea-block"
              placeholder=""
              rows={4}
            ></textarea>
          </div>
          <div class="flex gap-3">
            <button class="btn btn-primary" onClick={handleUpdateElection}>
              Update Pemilihan
            </button>
            <button class="btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
