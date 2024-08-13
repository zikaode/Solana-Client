import { createSignal, createEffect, onMount } from "solid-js";
import Select from "@preline/select";

export function CandidateModal({ users, selectedCandidatesProp, onClose }) {
  const [selectedKetua, setSelectedKetua] = createSignal("");
  const [selectedWakil, setSelectedWakil] = createSignal("");
  const [availableCandidate, setAvailableCandidate] = createSignal(users);
  const [availableWakil, setAvailableWakil] = createSignal(users);
  const [selectKetua, setSelectKetua] = createSignal();
  const [selectWakil, setSelectWakil] = createSignal();

  let selectRef = [];

  // Menghapus kandidat yang sudah dipilih dari daftar opsi
  onMount(() => {
    const selectedIds = selectedCandidatesProp?.flatMap((candidate) => [
      candidate.ketuaId,
      candidate.wakilId,
    ]);
    const availableCandidates = users.filter(
      (user) => !selectedIds.includes(user.id)
    );
    setAvailableCandidate(availableCandidates);
    setAvailableWakil(availableCandidates);

    const options = {
      hasSearch: true,
      searchPlaceholder: "Search...",
      searchClasses:
        "block w-full text-sm border-gray-800 rounded-lg focus:border-blue-500 focus:ring-blue-500 before:absolute before:inset-0 before:z-[1] dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 py-2 px-3",
      searchWrapperClasses:
        "bg-white bg-o p-2 -mx-1 sticky top-0 dark:bg-neutral-900",
      placeholder: "Select Candidate...",
      toggleTag:
        '<button type="button"><span class="me-2" data-icon></span><span class="text-gray-800 dark:text-neutral-200" data-title></span></button>',
      toggleClasses:
        "hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 relative py-3 px-4 pe-9 flex text-nowrap w-full cursor-pointer bg-white border border-gray-200 rounded-lg text-start text-sm focus:border-blue-500 focus:ring-blue-500 before:absolute before:inset-0 before:z-[1] dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400",
      dropdownClasses:
        "mt-2 max-h-72 pb-1 px-1 space-y-0.5 z-20 w-full bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 dark:bg-neutral-900 dark:border-neutral-700",
      optionClasses:
        "py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 dark:focus:bg-neutral-800",
      optionTemplate:
        '<div><div class="flex items-center"><div class="me-2" data-icon></div><div class="text-gray-800 dark:text-neutral-200" data-title></div></div></div>',
      extraMarkup:
        '<div class="absolute top-1/2 end-3 -translate-y-1/2"><svg class="flex-shrink-0 size-3.5 text-black dark:text-neutral-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg></div>',
    };
    setSelectKetua(new Select(selectRef[0], options));
    setSelectWakil(new Select(selectRef[1], options));
  });

  createEffect(() => {
    if (selectedKetua()) {
      setAvailableWakil(
        availableCandidate()?.filter((u) => u.id !== selectedKetua())
      );
      setSelectedWakil("");
    }
  });

  const handleAddCandidate = () => {
    if (selectedKetua() && selectedWakil()) {
      // Pass candidate data back to the form
      window.dispatchEvent(
        new CustomEvent("addCandidate", {
          detail: { ketuaId: selectedKetua(), wakilId: selectedWakil() },
          bubbles: true,
        })
      );
      onClose();
    } else {
      alert("Please select both Ketua and Wakil.");
    }
  };

  return (
    <>
      <input class="modal-state" id="candidate-modal" type="checkbox" checked />
      <div class="modal">
        <label
          class="modal-overlay"
          for="candidate-modal"
          onClick={onClose}
        ></label>
        <div class="modal-content flex flex-col gap-5 w-full">
          <label
            for="candidate-modal"
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </label>
          <h2 class="text-xl">Tambah Kandidat</h2>
          <h4 class="text-xs font-mono">
            Menampilkan Kandidat Terdaftar Pada SmartContract..
          </h4>
          <div class="space-y-4">
            <div>
              <label for="ketua" class="block text-sm font-medium  mb-2">
                Ketua
              </label>
              <select
                ref={selectRef[0]}
                class="hidden"
                id="ketua"
                value={selectedKetua()}
                onChange={(e) => {
                  setSelectedKetua(e.target.value);
                  selectKetua().close();
                }}
              >
                <option value="">Select Ketua</option>
                {availableCandidate().map((user) => (
                  <option value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label for="wakil" class="block text-sm font-medium  mb-2">
                Wakil
              </label>
              <select
                ref={selectRef[1]}
                id="wakil"
                class="hidden"
                value={selectedWakil()}
                onChange={(e) => {
                  setSelectedWakil(e.target.value);
                  selectWakil().close();
                }}
              >
                <option value="">Select Wakil</option>
                {availableWakil().map((user) => (
                  <option value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div class="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleAddCandidate}
                class="btn btn-primary"
              >
                Tambah
              </button>
              <button type="button" onClick={onClose} class="btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
