import { createEffect, createSignal, onMount, onCleanup, Show } from "solid-js";
import { useGlobalContext } from "../../context/globalContext";
import { useLocation, useNavigate } from "@solidjs/router";
import Sidebar from "../template/sidebar";
import { changePassword } from "../../api/profile";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");
  const [confirmNewPassword, setConfirmNewPassword] = createSignal("");
  const [successMessage, setSuccessMessage] = createSignal("");
  const [errorMessage, setErrorMessage] = createSignal([]);
  const [loading, setLoading] = createSignal(false);
  const [time, setTime] = createSignal(new Date());

  const [globalState, setGlobalState] = useGlobalContext();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await changePassword(
        localStorage.getItem("token") || "",
        oldPassword(),
        newPassword(),
        confirmNewPassword()
      );
      const data = await response.json();
      if (response.ok) {
        setSuccessMessage("Password updated successfully");
        if (errorMessage().length > 0) {
          setTimeout(() => {
            setErrorMessage([]);
            setSuccessMessage(data.massage);
          }, 1000);
        } else setSuccessMessage(data.massage);
      } else {
        setErrorMessage(data.errors);
        setSuccessMessage("");
      }
    } catch (error) {
      setErrorMessage([{ msg: "Error changing password" }]);
      setSuccessMessage("");
    } finally {
      setLoading(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => {
        setErrorMessage([]);
        setSuccessMessage("Logout.. Please Re-Login!");
        setTimeout(() => {
          navigate("/logout");
        }, 1000);
      }, 2500);
    }
  };

  return (
    <div class="flex flex-1 h-px my-2">
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
              {errorMessage().map((item, index) => (
                <span class="text-content2 py-1" key={index}>
                  {item.msg}
                </span>
              ))}
            </div>
          </div>
        )}
        <Show
          when={successMessage().length === 0}
          fallback={
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
          }
        ></Show>
      </div>
      <Sidebar path={location.pathname}>
        <div class="flex flex-col justify-center gap-2">
          <h1 class="font-semibold text-2xl text-center mt-2">UBAH PASSWORD</h1>
          <h1 class="font-normal text-sm text-end px-8">
            {time().toLocaleString()}
          </h1>
          <form onsubmit={handlePasswordChange} class="lg:px-8">
            <div class="form-group">
              <div class="form-field mb-2">
                <label class="form-label font-semibold">Password Lama</label>
                <input
                  type="password"
                  class="input max-w-full"
                  value={oldPassword()}
                  onInput={(e) => setOldPassword(e.currentTarget.value)}
                />
              </div>
              <div class="form-field mb-2">
                <label class="form-label font-semibold">Password Baru</label>
                <input
                  type="password"
                  class="input max-w-full"
                  value={newPassword()}
                  onInput={(e) => setNewPassword(e.currentTarget.value)}
                />
              </div>
              <div class="form-field mb-2">
                <label class="form-label font-semibold">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  class="input max-w-full"
                  value={confirmNewPassword()}
                  onInput={(e) => setConfirmNewPassword(e.currentTarget.value)}
                />
              </div>
              <label class="form-label">
                <span class="form-label-alt w-full text-end text-[10px]">
                  Otomatis Logout Saat Update Berhasil
                </span>
              </label>
              <div class="form-field pt-5">
                <div class="form-control justify-between">
                  <button
                    type="submit"
                    disabled={loading()}
                    class={
                      "btn btn-primary w-full " + (loading() && "btn-loading")
                    }
                  >
                    Ubah Password
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Sidebar>
    </div>
  );
};

export default ChangePassword;
