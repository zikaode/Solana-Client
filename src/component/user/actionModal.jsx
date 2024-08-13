import { useGlobalContext } from "../../context/globalContext";
import { createSignal, createEffect } from "solid-js";

const ActionModal = ({ user }) => {
  const [globalState, setGlobalState] = useGlobalContext();
  const [isOpen, setIsOpen] = createSignal(false);
  const [newAccess, setNewAccess] = createSignal(user.access);
  const [isTerminate, setIsTerminate] = createSignal(false);
  const [successMessage, setSuccessMessage] = createSignal("");
  const [errorMessage, setErrorMessage] = createSignal([]);

  createEffect(() => {
    setNewAccess(user.access);
    setIsTerminate(user.isTerminate);
  }, [user]);

  createEffect(() => {
    if (!isOpen()) {
      document.getElementById(`modal-${user.id}`).checked = false;
    }
  }, [isOpen]);

  const handleChangeAccess = async () => {
    const endpoint =
      newAccess() === "CANDIDATE"
        ? `https://evoting-server.vercel.app/user/create-candidate/${user.id}`
        : `https://evoting-server.vercel.app/user/create-saksi/${user.id}`;
    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        setErrorMessage([...errorMessage(), ...result.errors]);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setSuccessMessage(result.message);
      setIsOpen(false);
    } catch (error) {
      setErrorMessage([{ msg: "Error While Change Access" }]);
      console.error("Error changing user access:", error);
      // You might want to show an error message to the user here
    } finally {
      setTimeout(() => {
        setErrorMessage([]);
        setSuccessMessage("");
        globalState().function();
      }, 2000);
    }
  };

  const handleTerminate = async () => {
    try {
      const response = await fetch(
        `https://evoting-server.vercel.app/user/terminate-account/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const result = await response.json();
        setErrorMessage([...errorMessage(), ...result.errors]);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setSuccessMessage(result.message);
      setIsOpen(false);
    } catch (error) {
      setErrorMessage([{ msg: "Error While Terminate Account" }]);
      console.error(
        "Error white unterminating/terminating user account:",
        error
      );
      // You might want to show an error message to the user here
    } finally {
      setTimeout(() => {
        setErrorMessage([]);
        setSuccessMessage("");
        globalState().function();
      }, 2000);
    }
  };

  return (
    <div class="h-10 flex items-center">
      <label
        class="btn btn-primary btn-xs"
        htmlFor={`modal-${user.id}`}
        onClick={() => setIsOpen(true)}
      >
        Ubah Akses
      </label>
      <input class="modal-state" id={`modal-${user.id}`} type="checkbox" />
      <div class="modal">
        <label class="modal-overlay" htmlFor={`modal-${user.id}`}></label>
        <div class="modal-content flex flex-col gap-5">
          <h2 class="text-base p-4 text-center">Akses untuk - {user.name}</h2>
          <div class="form-control mb-4 flex items-center">
            <label class="label">
              <span class="label-text">Ubah Akses</span>
            </label>
            <select
              class="select select-bordered"
              value={newAccess()}
              onInput={(e) => setNewAccess(e.currentTarget.value)}
            >
              <option value="USER">USER</option>
              <option value="CANDIDATE">CANDIDATE</option>
              <option value="SAKSI">SAKSI</option>
            </select>
          </div>
          <div class="flex gap-3 justify-end">
            {newAccess() !== "USER" && (
              <button
                class="btn btn-primary btn-sm"
                onClick={handleChangeAccess}
              >
                Ubah Ke {' "' + newAccess() + '"'}
              </button>
            )}
            {
              <button
                class={
                  "btn btn-sm " + (isTerminate() ? "btn-success" : "btn-error")
                }
                onClick={handleTerminate}
              >
                {isTerminate() ? 'Buka "Blokir Akses"' : "Blokir Akses"}
              </button>
            }
            <button class="btn btn-sm" onClick={() => setIsOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
      <div class="text-sm text-left">
        {!(errorMessage().length === 0) && (
          <div class="alert alert-error absolute bottom-12 left-2 z-20 px-2 py-0.5 w-max max-w-[calc(100%-16px)] sm:max-w-md">
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
                d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 26C22.9 26 22 25.1 22 24V16C22 14.9 22.9 14 24 14C25.1 14 26 14.9 26 16V24C26 25.1 25.1 26 24 26ZM26 34H22V30H26V34Z"
                fill="#E92C2C"
              />
            </svg>
            <div class="flex flex-col">
              <For each={errorMessage()}>
                {(item, index) => (
                  <span class="text-content2 py-1" key={index()}>
                    {item.msg}
                  </span>
                )}
              </For>
            </div>
          </div>
        )}
        {!(successMessage().length === 0) && (
          <div class="alert alert-success absolute bottom-12 left-2 z-20 px-2 py-0.5 w-max max-w-[calc(100%-16px)] sm:max-w-md">
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
                d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM18.58 32.58L11.4 25.4C10.62 24.62 10.62 23.36 11.4 22.58C12.18 21.8 13.44 21.8 14.22 22.58L20 28.34L33.76 14.58C34.54 13.8 35.8 13.8 36.58 14.58C37.36 15.36 37.36 16.62 36.58 17.4L21.4 32.58C20.64 33.36 19.36 33.36 18.58 32.58Z"
                fill="#00BA34"
              />
            </svg>
            <div class="flex flex-col">
              <span class="text-content2 py-1">{successMessage()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionModal;
