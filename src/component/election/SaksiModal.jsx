import { createSignal, onMount } from "solid-js";

export function SaksiModal({ users, selectedSaksiProp, onClose }) {
  const [selectedSaksi, setSelectedSaksi] = createSignal([]);

  onMount(() => {
    setSelectedSaksi(selectedSaksiProp);
  });

  const handleAddSaksi = () => {
    if (selectedSaksi().length > 0) {
      // Pass saksi data back to the form
      window.dispatchEvent(
        new CustomEvent("addSaksi", {
          detail: selectedSaksi(),
        })
      );
      onClose();
    } else {
      alert("Please select at least one Saksi.");
    }
  };

  return (
    <>
      <input class="modal-state" id="saksi-modal" type="checkbox" checked />
      <div class="modal">
        <label
          class="modal-overlay"
          for="saksi-modal"
          onClick={onClose}
        ></label>
        <div class="modal-content flex flex-col gap-5 w-full">
          <label
            for="saksi-modal"
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </label>
          <h2 class="text-xl">Tambahkan Saksi</h2>
          <h4 class="text-xs font-mono">
            Menampilkan Saksi Terdaftar Pada SmartContract..
          </h4>
          <div class="space-y-4">
            <div class="flex flex-col gap-2">
              {users?.map((user) => (
                <div class="flex items-center" key={user.id}>
                  <input
                    type="checkbox"
                    id={user.id}
                    value={user.id}
                    checked={selectedSaksi().includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSaksi([...selectedSaksi(), user.id]);
                      } else {
                        setSelectedSaksi(
                          selectedSaksi().filter((id) => id !== user.id)
                        );
                      }
                    }}
                    class="checkbox"
                  />
                  <label for={user.id} class="ml-2 block text-sm">
                    {user.name}
                  </label>
                </div>
              ))}
            </div>
            <div class="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleAddSaksi}
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
