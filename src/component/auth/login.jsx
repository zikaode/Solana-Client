import { useGlobalContext } from "../../context/globalContext";
import { createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { loginUser } from "../../api/auth";
import { profileUser } from "../../api/profile";

const Login = () => {
  const [globalState, setGlobalState] = useGlobalContext();
  const navigate = useNavigate();

  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");

  const [errorMessage, setErrorMessage] = createSignal([]);
  const [successMessage, setSuccessMessage] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  createEffect(() => {
    if (globalState()?.user) navigate("/", { replace: true });
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let temp = [];
    console.log(globalState());
    try {
      setLoading(true);
      clearTimeout(temp.shift);
      const user = await loginUser(email(), password());
      if (user.ok) {
        const data = await user.json();
        localStorage.setItem("token", data.data.token);
        setSuccessMessage(data.massage);
        setErrorMessage([]);
        console.log(globalState());
        setGlobalState({
          ...globalState(),
          loading: true,
        });
        try {
          const user = await profileUser(localStorage.getItem("token"));
          if (user.ok) {
            const data = await user.json();
            setGlobalState({
              ...globalState(),
              user: { ...data.data },
              loading: false,
            });
          } else if (user.status === 401) {
            const { errors } = await user.json();
            setErrorMessage([...errors]);
          }
          console.log(globalState());
          setGlobalState({ ...globalState(), loading: false });
        } catch (error) {
          setGlobalState({ ...globalState(), loading: false });
          console.error("Error fetching profile:", error);
        } finally {
          navigate("/dashboard", { replace: true });
        }
        console.log(globalState());
      } else {
        temp.push(
          setTimeout(() => {
            setErrorMessage([]);
          }, 3500)
        );

        const { errors } = await user.json();
        setErrorMessage([...errors]);
      }
    } catch (error) {
      temp.push(
        setTimeout(() => {
          setErrorMessage([]);
        }, 3500)
      );
      setErrorMessage([{ msg: "Internal server error" }]);
    }
  };

  return (
    <div class="flex flex-auto items-center justify-center mx-5">
      <div class="mx-auto flex w-full max-w-sm flex-col gap-6">
        <div class="flex flex-col items-center">
          <h1 class="text-3xl font-semibold pb-2">Masuk</h1>
          <p class="text-sm">Masuk Ke Akun-mu Untuk Mengakses Aplikasi..</p>
        </div>
        {!(errorMessage().length === 0) && (
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
              <span class="text-content2 py-1">{successMessage()}</span>
            </div>
          </div>
        )}
        <form onsubmit={handleSubmit}>
          <div class="form-group">
            <div class="form-field">
              <label class="block text-white font-bold mb-2">Email</label>
              <input
                id="email"
                type="email"
                class="input max-w-full bg-stone-100 text-zinc-800"
                value={email()}
                onInput={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              {/* Error message for invalid email */}
            </div>
            <div class="form-field">
              <label class="block text-white font-bold mb-2">Password</label>
              <div class="form-control">
                <input
                  id="password"
                  type="password"
                  class="input max-w-full bg-stone-100 text-zinc-800"
                  value={password()}
                  onInput={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div class="form-field">
              <div class="form-control justify-between">
                <div class="flex gap-2">
                  {/* Checkbox for "Remember me" */}
                  {/* <input type="checkbox" class="checkbox" /> */}
                  {/* <a href="#">Remember me</a> */}
                </div>
                <label class="form-label">
                  <a
                    class="link link-underline-hover link-primary text-sm text-white"
                    href="/forgot-password"
                  >
                    Lupa Password?
                  </a>
                </label>
              </div>
            </div>
            <div class="form-field pt-5">
              <div class="form-control justify-between">
                <button
                  type="submit"
                  class={
                    "btn btn-primary w-full " + (loading() && "btn-loading")
                  }
                >
                  Masuk
                </button>
              </div>
            </div>
            <div class="form-field">
              <div class="form-control justify-center">
                <a
                  href="/register"
                  class="link link-underline-hover link-primary text-sm text-white"
                >
                  Belum Memiliki Akun? Mendaftar.
                </a>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
