import { createEffect, onMount, createSignal } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { verifyEmail } from "../../api/auth";

const VerifyEmail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const token = params.token;

  const [errorMessage, setErrorMessage] = createSignal([]);
  const [successMessage, setSuccessMessage] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  onMount(async () => {
    try {
      setLoading(true);
      const response = await verifyEmail(token);
      if (response.ok) {
        setSuccessMessage("Email Verify Successfully!");
        setErrorMessage([]);
      } else {
        const { errors } = await response.json();
        setErrorMessage([...errors]);
      }
      setLoading(false);
    } catch (error) {
      setErrorMessage([{ msg: "Internal server error" }]);
      console.error("Error caught in catch block:", error);
      setLoading(false);
    }
  });

  return (
    <div class="mx-auto flex flex-auto w-full max-w-4xl flex-col gap-6 mt-12">
      <h2 class="text-center text-2xl">Verifikasi Email</h2>
      <div
        class={
          "alert " +
          (loading() ? "" : successMessage() ? "alert-success" : "alert-error")
        }
      >
        {loading() ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
            class="w-12"
          >
            <radialGradient
              id="a8"
              cx=".66"
              fx=".66"
              cy=".3125"
              fy=".3125"
              gradientTransform="scale(1.5)"
            >
              <stop offset="0" stop-color="#FFFFFF"></stop>
              <stop offset=".3" stop-color="#FFFFFF" stop-opacity=".9"></stop>
              <stop offset=".6" stop-color="#FFFFFF" stop-opacity=".6"></stop>
              <stop offset=".8" stop-color="#FFFFFF" stop-opacity=".3"></stop>
              <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"></stop>
            </radialGradient>
            <circle
              transform-origin="center"
              fill="none"
              stroke="url(#a8)"
              stroke-width="15"
              stroke-linecap="round"
              stroke-dasharray="200 1000"
              stroke-dashoffset="0"
              cx="100"
              cy="100"
              r="70"
            >
              <animateTransform
                type="rotate"
                attributeName="transform"
                calcMode="spline"
                dur="1.3"
                values="360;0"
                keyTimes="0;1"
                keySplines="0 0 1 1"
                repeatCount="indefinite"
              ></animateTransform>
            </circle>
            <circle
              transform-origin="center"
              fill="none"
              opacity=".2"
              stroke="#FFFFFF"
              stroke-width="15"
              stroke-linecap="round"
              cx="100"
              cy="100"
              r="70"
            ></circle>
          </svg>
        ) : successMessage() ? (
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
        ) : (
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
        )}
        <div class="flex flex-col">
          <span>
            {successMessage()
              ? successMessage()
              : errorMessage() &&
                (loading() ? (
                  "Memverifikasi Email"
                ) : (
                  <>
                    Gagal Saat Memverifikasi Email.. <br />
                    ID Tidak Valid: {token}
                  </>
                ))}
          </span>
          <span class="text-content2">
            <a class="link link-warning" href="/login">
              Kembali Ke Halaman Masuk
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
