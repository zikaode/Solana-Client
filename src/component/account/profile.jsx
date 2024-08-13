import {
  createEffect,
  createSignal,
  onMount,
  onCleanup,
  Show,
  For,
} from "solid-js";
import { useGlobalContext } from "../../context/globalContext";
import { useLocation, useNavigate } from "@solidjs/router";
import Sidebar from "../template/sidebar";
import { updateProfileUser, profileUser } from "../../api/profile";

const ProfileEdit = () => {
  const jurusanProdiMap = {
    SIPIL: [
      "KONSTRUKSI_BANGUNAN_AIR",
      "KONSTRUKSI_JALAN_JEMBATAN",
      "KONSTRUKSI_BANGUNAN_GEDUNG",
      "REKAYASA_KONSTRUKSI_JALAN_JEMBATAN",
    ],
    KIMIA: [
      "TEKNOLOGI_KIMIA",
      "TEKNOLOGI_PENGOLAHAN_MINYAK_DAN_GAS",
      "REKAYASA_KIMIA_INDUSTRI",
    ],
    ELEKTRO: [
      "LISTRIK",
      "TELEKOMUNIKASI",
      "ELEKTRONIKA",
      "REKAYASA_PEMBANGKIT_LISTRIK",
      "REKAYASA_JARINGAN_TELEKOMUNIKASI",
      "REKAYASA_INSTRUMEN_DAN_KONTROL",
    ],
    TATA_NIAGA: [
      "AKUTANSI",
      "ADMINISTRASI_BISNIS",
      "KEUANGAN_SEKTOR_PULIK",
      "LEMBAGA_KEUANGAN_SYARIAH",
    ],
    MESIN: [
      "TEKNOLOGI_INDUSTRI",
      "TEKNOLOGI_MESIN",
      "REKAYASA_MANUFAKTURING",
      "REKAYASA_PENGELASAN_DAN_FABRIKASI",
    ],
    TIK: [
      "REKAYASA_MULTIMEDIA",
      "TEKNOLOGI_KOMPUTER_JARINGAN",
      "TEKNIK_INFORMATIKA",
    ],
  };
  const [globalState, setGlobalState] = useGlobalContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [time, setTime] = createSignal(new Date());

  const [prodiOptions, setProdiOptions] = createSignal([]);
  const [selectedJurusan, setSelectedJurusan] = createSignal("");
  const [selectedProdi, setSelectedProdi] = createSignal("");

  const [successMessage, setSuccessMessage] = createSignal("");
  const [errorMessage, setErrorMessage] = createSignal([]);
  const [loading, setloading] = createSignal(false);

  const [profileChange, setProfileChange] = createSignal(true);
  const [selectedProfile, setSelectedProfile] = createSignal(null);
  const [selectedKTM, setSelectedKTM] = createSignal(null);

  const [form, setForm] = createSignal({
    nim: "",
    image: "",
    imageKTM: "",
  });

  const serverUrl = "https://evoting-server.vercel.app";

  createEffect(() => {
    if (!globalState()?.loading) {
      console.log(globalState()?.user?.email);
      if (!globalState()?.user?.email) navigate("/", { replace: true });
    }
  });

  createEffect(() => {
    if (profileChange() && globalState()?.user) {
      setSelectedJurusan(globalState()?.user?.profile?.jurusan);
      setSelectedProdi(globalState()?.user?.profile?.prodi);
      setForm({
        ...form(),
        nim: globalState()?.user?.profile?.nim
          ? globalState()?.user?.profile?.nim
          : "",
      });
      setProfileChange(false);
    }
    setProdiOptions(jurusanProdiMap[selectedJurusan()] || []);
  });

  createEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    onCleanup(() => clearInterval(interval));
  });

  const handleFileChange = (e) => {
    console.log(e.target.files[0]);
    if (e.currentTarget.id == "foto-profile")
      setSelectedProfile(e.target.files[0]);
    if (e.currentTarget.id == "foto-ktm") {
      setSelectedKTM(e.target.files[0]);
      console.log(selectedProfile(), selectedKTM());
    }
  };

  const handleSubmit = async (e) => {
    let temp = [];
    clearTimeout(temp.shift);
    e.preventDefault();
    // if (!selectedFile()) return;
    setloading(true);

    const formDataProfile = new FormData();
    const formDataKTM = new FormData();
    formDataProfile.append("image", selectedProfile());
    formDataKTM.append("image", selectedKTM());

    try {
      const data = { profile: null, ktm: null };
      setErrorMessage([]);

      if (selectedProfile()) {
        const response = await fetch(serverUrl + "/upload/", {
          method: "POST",
          body: formDataProfile,
        });

        data.profile = await response.json();

        if (response.ok) {
          setForm({ ...form(), image: data.profile.imageUrl });
        } else {
          setErrorMessage([...errorMessage(), ...data.profile.errors]);
        }
      }

      if (selectedKTM()) {
        const response = await fetch(serverUrl + "/upload/", {
          method: "POST",
          body: formDataKTM,
        });

        data.ktm = await response.json();

        if (response.ok) {
          setForm({ ...form(), imageKTM: data.ktm.imageUrl });
        } else {
          setErrorMessage([...errorMessage(), ...data.ktm.errors]);
        }
      }
    } catch (error) {
      setErrorMessage([{ msg: "Error While Uploading Images" }]);
    } finally {
      selectedProfile(null);
      selectedKTM(null);
    }

    try {
      const response = await updateProfileUser(
        localStorage.getItem("token") || "",
        form().nim,
        selectedProdi(),
        selectedJurusan(),
        "Not Set",
        form().image,
        form().imageKTM
      );
      if (response.ok) {
        const data = await response.json();
        if (errorMessage().length > 0) {
          setTimeout(() => {
            setErrorMessage([]);
            setSuccessMessage(data.massage);
          }, 1000);
        } else setSuccessMessage(data.massage);
      } else {
        const { errors } = await response.json();
        setErrorMessage([...errorMessage(), ...errors]);
      }
    } catch (error) {
      setErrorMessage([{ msg: "Error While Update Profile" }]);
    } finally {
      temp.push(
        setTimeout(() => {
          setErrorMessage([]);
          setSuccessMessage("");
        }, 2500)
      );

      try {
        const user = await profileUser(localStorage.getItem("token"));
        if (user.ok) {
          const data = await user.json();
          setGlobalState({
            ...globalState(),
            user: { ...data.data },
            loading: false,
          });
        }
        setGlobalState({ ...globalState(), loading: false });
      } catch (error) {
        setGlobalState({ ...globalState(), loading: false });
        console.error("Error fetching profile:", error);
      }
      setloading(false);
    }
  };

  return (
    <div class="flex flex-1 h-px my-2">
      <Sidebar path={location.pathname}>
        <div>
          <input class="modal-state" id="modal-1" type="checkbox" />
          <div class="modal">
            <label class="modal-overlay" for="modal-1"></label>
            <div class="modal-content flex flex-col gap-5">
              <label
                for="modal-1"
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              >
                ✕
              </label>
              <h2 class="text-xl">Preview KTM</h2>
              <img src={globalState()?.user?.profile?.imageKTM} alt="" />
            </div>
          </div>
        </div>
        <div class="flex flex-col justify-center gap-2">
          <h1 class="font-semibold text-2xl text-center mt-2">
            PROFIL
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
          </h1>
          <h1 class="font-normal text-sm text-end">
            {time().toLocaleString()}
          </h1>
          <form onsubmit={handleSubmit}>
            <div class="form-group">
              <div class="flex gap-4 mb-2 flex-col md:flex-row">
                <div class="form-field flex-auto">
                  <label class="form-label font-semibold">
                    NIM {globalState()?.user?.profile?.nim ? "" : "*"}
                  </label>
                  <input
                    type="text"
                    class="input max-w-full" // + input-error
                    value={form().nim}
                    onInput={(e) => {
                      setForm({ ...form(), nim: e.currentTarget.value });
                    }}
                    pattern="[0-9]*"
                  />
                  <label class="form-label">
                    <span class="form-label-alt w-full text-end text-[10px]">
                      Pastikan NIM Sesuai Dengan KTM
                    </span>
                  </label>
                </div>
                <div class="form-field flex-auto">
                  <label class="form-label font-semibold">Nama</label>
                  <input
                    type="email"
                    class="input max-w-full" // + input-error
                    disabled
                    value={
                      globalState()?.user?.name ? globalState()?.user?.name : ""
                    }
                  />
                  <label class="form-label">
                    <span class="form-label-alt w-full text-end text-[10px]">
                      Nama tidak dapat diubah
                    </span>
                  </label>
                </div>
              </div>
              <div class="form-field mb-2">
                <label class="form-label font-semibold">Email</label>
                <input
                  type="email"
                  class="input max-w-full" // + input-error
                  disabled
                  value={
                    globalState()?.user?.email ? globalState()?.user?.email : ""
                  }
                />
                <label class="form-label">
                  <span class="form-label-alt w-full text-end text-[10px]">
                    Email tidak dapat diubah
                  </span>
                </label>
              </div>
              <div class="flex gap-4 mb-6 flex-col md:flex-row">
                <div class="form-field flex-auto">
                  <label class="form-label font-semibold" for="jurusan">
                    Jurusan {globalState()?.user?.profile?.nim ? "" : "*"}
                  </label>
                  <select
                    class="select max-w-full"
                    id="jurusan"
                    onChange={(e) => setSelectedJurusan(e.target.value)}
                  >
                    <option value="">--Pilih Jurusan--</option>
                    {Object.keys(jurusanProdiMap).map((jurusan) => (
                      <option
                        value={jurusan}
                        selected={
                          selectedJurusan() === jurusan ? "selected" : ""
                        }
                      >
                        {jurusan.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  {/* <label class="form-label">
                  <span class="form-label-alt w-full text-end text-[10px]">
                    Dapat dilihat publik
                  </span>
                </label> */}
                </div>
                <div class="form-field flex-auto">
                  <label class="form-label font-semibold" for="prodi">
                    Prodi {globalState()?.user?.profile?.nim ? "" : "*"}
                  </label>
                  <select
                    class="select max-w-full"
                    id="prodi"
                    onChange={(e) => setSelectedProdi(e.target.value)}
                  >
                    <option value="">--Pilih Prodi--</option>
                    {prodiOptions().map((prodi) => (
                      <option
                        value={prodi}
                        selected={selectedProdi() === prodi ? "selected" : ""}
                      >
                        {prodi.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  {/* <label class="form-label">
                  <span class="form-label-alt w-full text-end text-[10px]">
                    Nama tidak dapat diubah
                  </span>
                </label> */}
                </div>
              </div>
              <div class="flex gap-4 mb-2 flex-col md:flex-row">
                <div class="form-field flex-auto">
                  <label class="form-label font-semibold" for="jurusan">
                    Foto Profile {globalState()?.user?.profile?.nim ? "" : "*"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    class="input-file max-w-full"
                    id="foto-profile"
                  />
                  {/* <label class="form-label">
                  <span class="form-label-alt w-full text-end text-[10px]">
                    Dapat dilihat publik
                  </span>
                </label> */}
                </div>
                <div class="form-field flex-auto">
                  <label class="form-label font-semibold" for="prodi">
                    Foto KTM {globalState()?.user?.profile?.nim ? "" : "*"}
                  </label>
                  <div class="flex flex-row gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      class="input-file max-w-full"
                      id="foto-ktm"
                    />
                    <Show
                      when={!globalState().user?.profile?.imageKTM}
                      fallback={
                        <label
                          class="btn p-0 bg-transparent h-full"
                          for="modal-1"
                        >
                          <img
                            src={
                              globalState().clienturl +
                              "/public/icons8-shortcut-100.png"
                            }
                            alt="link"
                            class="w-8 invert"
                          />
                        </label>
                      }
                    ></Show>
                  </div>
                  <label class="form-label">
                    <span class="form-label-alt w-full text-end text-[10px]">
                      Pastikan KTM Masih Aktif
                    </span>
                  </label>
                </div>
              </div>
              <div class="form-field pt-5">
                <div class="form-control justify-between">
                  <button
                    type="submit"
                    disabled={loading()}
                    class={
                      "btn btn-primary w-full " + (loading() && "btn-loading")
                    }
                  >
                    Submit
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

export default ProfileEdit;
