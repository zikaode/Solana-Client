import { createSignal, Show, createEffect } from "solid-js";
import { useGlobalContext } from "../../context/globalContext";
import { registerUser } from "../../api/auth";
import { useNavigate } from "@solidjs/router";

const RegisterForm = () => {
  const [form, setForm] = createSignal({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const [ErrorMessage, setErrorMessage] = createSignal();
  const [loading, setLoading] = createSignal(false);
  const [success, setSuccess] = createSignal(false);
  const [globalState, setGlobalState] = useGlobalContext();

  createEffect(() => {
    console.log(globalState());
    if (globalState().user) navigate("/", { replace: true });
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let temp = [];
    try {
      setLoading(true);
      const response = await registerUser(
        form().name,
        form().email,
        form().password
      );
      if (response.status === 201) {
        setSuccess(true);
        setForm({ name: "", email: "", password: "" });
        setErrors({});
        setSubmitError(null);
      } else {
        setLoading(false);
        const { errors } = await response.json();
        temp.push(
          setTimeout(() => {
            setErrorMessage();
          }, 3500)
        );
        setErrorMessage([...errors]);
      }
    } catch (error) {
      setLoading(false);
      temp.push(
        setTimeout(() => {
          setErrorMessage();
        }, 3500)
      );
      setErrorMessage([{ msg: "Internal server error" }]);
    }
  };

  return (
    <div
      class={
        "flex flex-auto justify-center mx-5 " +
        (success() ? "mt-12" : "items-center")
      }
    >
      <div
        class={
          "mx-auto flex w-full flex-col gap-6 " +
          (success() ? "max-w-2xl" : "max-w-sm")
        }
      >
        <Show
          when={success()}
          fallback={
            <div class="flex flex-col items-center">
              <h1 class="text-3xl font-semibold pb-2">Daftar</h1>
              <p class="text-sm">Daftarkan Akun-mu Untuk Mengakses Aplikasi</p>
            </div>
          }
        ></Show>
        <Show
          when={!success()}
          fallback={
            <>
              <h1 class="text-3xl font-semibold pb-2 text-center">
                Terima Kasih!
              </h1>
              <div class="alert alert-success">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM18.58 32.58L11.4 25.4C10.62 24.62 10.62 23.36 11.4 22.58C12.18 21.8 13.44 21.8 14.22 22.58L20 28.34L33.76 14.58C34.54 13.8 35.8 13.8 36.58 14.58C37.36 15.36 37.36 16.62 36.58 17.4L21.4 32.58C20.64 33.36 19.36 33.36 18.58 32.58Z"
                    fill="#00BA34"
                  />
                </svg>
                <div class="flex flex-col">
                  <span>Pendaftaran Berhasil</span>
                  <span class="text-content2">
                    Silahkan Cek Email-mu dan Verifikasi Akun!
                  </span>
                  <span class="text-content2">
                    <a class="link link-warning" href="/login">
                      Kembali Ke Halaman Masuk
                    </a>
                  </span>
                </div>
              </div>
            </>
          }
        >
          <Show when={ErrorMessage()}>
            <div class="alert alert-error">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 26C22.9 26 22 25.1 22 24V16C22 14.9 22.9 14 24 14C25.1 14 26 14.9 26 16V24C26 25.1 25.1 26 24 26ZM26 34H22V30H26V34Z"
                  fill="#E92C2C"
                />
              </svg>
              <div class="flex flex-col">
                <For each={ErrorMessage()}>
                  {(item, index) => (
                    <span class="text-content2 py-1" key={index()}>
                      {item.msg}
                    </span>
                  )}
                </For>
              </div>
            </div>
          </Show>
          <form onSubmit={handleSubmit}>
            <div class="mb-4">
              <label class="block text-white font-bold mb-2" for="name">
                <div class="flex flex-row justify-between items-center">
                  <span>Nama Lengkap</span>
                  <label class="form-label">
                    <span class="form-label-alt w-full text-end text-[10px]">
                      Nama Tidak Dapat Diubah Kembali!
                    </span>
                  </label>
                </div>
              </label>
              <input
                class="input max-w-full bg-stone-100 text-zinc-800"
                id="name"
                type="text"
                value={form().name}
                onInput={(e) =>
                  setForm({ ...form(), name: e.currentTarget.value })
                }
                required
              />
            </div>
            <div class="mb-4">
              <label class="block text-white font-bold mb-2" for="email">
                Email
              </label>
              <input
                class="input max-w-full bg-stone-100 text-zinc-800"
                id="email"
                type="email"
                value={form().email}
                onInput={(e) =>
                  setForm({ ...form(), email: e.currentTarget.value })
                }
                required
              />
            </div>
            <div class="mb-6">
              <label class="block text-white font-bold mb-2" for="password">
                Password
              </label>
              <input
                class="input max-w-full bg-stone-100 text-zinc-800"
                id="password"
                type="password"
                value={form().password}
                onInput={(e) =>
                  setForm({ ...form(), password: e.currentTarget.value })
                }
                required
              />
            </div>
            <div class="form-field">
              <div class="flex items-center justify-between">
                <button
                  class={
                    "btn btn-primary w-full " + (loading() && "btn-loading")
                  }
                  type="submit"
                >
                  Daftar Akun
                </button>
              </div>
            </div>
            <div class="form-field pt-3">
              <div class="form-control justify-center">
                <a
                  href="/login"
                  class="link link-underline-hover link-primary text-sm text-white"
                >
                  Sudah Memiliki Akun? Masuk.
                </a>
              </div>
            </div>
          </form>
        </Show>
      </div>
    </div>
  );
};

export default RegisterForm;
