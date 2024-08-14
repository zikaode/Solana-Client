import { useGlobalContext } from "../../context/globalContext";
import { createEffect, createSignal, onMount } from "solid-js";

const Sidebar = (props) => {
  const [globalState, setGlobalState] = useGlobalContext();

  return (
    <>
      <div class="flex flex-row flex-1 container mx-auto bg-gray-900 sm:gap-2">
        <div class="sm:w-full sm:max-w-[18rem] border-slate-800 rounded-lg sm:border-2 p-0 sm:p-2">
          <input
            type="checkbox"
            id="sidebar-mobile-fixed"
            class="sidebar-state"
          />
          <label for="sidebar-mobile-fixed" class="sidebar-overlay"></label>
          <aside class="sidebar sidebar-mobile h-full justify-start max-sm:fixed max-sm:-translate-x-full bg-gray-900">
            <section class="sidebar-title justify-center items-center p-4">
              <div class="flex flex-col items-center">
                <span class="text-lg font-semibold text-center mb-2">
                  {globalState()?.user?.name}
                </span>
                <span class="text-xs font-normal text-content2">
                  {globalState()?.user?.access}
                </span>
              </div>
            </section>
            <section class="sidebar-content">
              <nav class="menu rounded-md">
                <section class="menu-section px-4">
                  <a
                    href="/dashboard"
                    class={
                      "menu-item " +
                      (props.path == "/dashboard" ? "menu-active" : "")
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 opacity-75"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>Halaman Utama</span>
                  </a>
                  <span class="menu-title font-semibold text-sm mt-4">
                    - Menu Akun -{" "}
                  </span>
                  <ul class="menu-items">
                    {/* <li class="menu-item">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 opacity-75"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>General</span>
                  </li>
                  <li class="menu-item">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 opacity-75"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>Teams</span>
                  </li>
                  <li class="menu-item">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 opacity-75"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <span>Billing</span>
                  </li> */}
                    <li>
                      <input type="checkbox" id="menu-1" class="menu-toggle" />
                      <label class="menu-item justify-between" for="menu-1">
                        <div class="flex gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5 opacity-75"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span>Pribadi</span>
                        </div>

                        <span class="menu-icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </span>
                      </label>

                      <div
                        class={
                          props.path == "/profile" ||
                          props.path == "/change-password"
                            ? "menu-item-active"
                            : "menu-item-collapse"
                        }
                      >
                        <div class="min-h-0">
                          {/* <label class="menu-item menu-item-disabled ml-6">
                          Change Email
                        </label> */}
                          <a
                            href="/profile"
                            class={
                              "menu-item ml-6 " +
                              (props.path == "/profile" ? "menu-active" : "")
                            }
                          >
                            Profil
                          </a>
                          <a
                            href="/change-password"
                            class={
                              "menu-item ml-6 " +
                              (props.path == "/change-password"
                                ? "menu-active"
                                : "")
                            }
                          >
                            Ubah Password
                          </a>
                        </div>
                      </div>
                    </li>
                    <a
                      href="/users"
                      class={
                        "menu-item " +
                        (props.path == "/users" ? "menu-active " : " ") +
                        (globalState()?.user?.access == "ADMIN" ? "" : "hidden")
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 opacity-75"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span>Data Semua Pengguna</span>
                    </a>
                    <span class="menu-title font-semibold text-sm mt-4">
                      - Menu Pemilihan -
                    </span>
                    <a
                      href="/election"
                      class={
                        "menu-item " +
                        (props.path.split("/")[1] == "election"
                          ? "menu-active "
                          : " ") +
                        (globalState()?.user?.access == "ADMIN" ||
                        globalState()?.user?.access == "SAKSI"
                          ? ""
                          : "hidden")
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 opacity-75"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span>Data Pemilihan</span>
                    </a>
                    <a
                      href="/election-vote"
                      class={
                        "menu-item " +
                        (props.path.split("/")[1] == "election-vote"
                          ? "menu-active"
                          : "")
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 opacity-75"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span>Voting</span>
                    </a>
                    <a
                      href="/result"
                      class={
                        "menu-item " +
                        (props.path.split("/")[1] == "result"
                          ? "menu-active"
                          : "")
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 opacity-75"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span>Hasil Pemilihan</span>
                    </a>
                  </ul>
                </section>
                {/* <div class="divider my-0"></div>
              <section class="menu-section px-4">
                <span class="menu-title">Settings</span>
                <ul class="menu-items">
                  <li class="menu-item">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="opacity-75"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M3 21l18 0"></path>
                      <path d="M3 10l18 0"></path>
                      <path d="M5 6l7 -3l7 3"></path>
                      <path d="M4 10l0 11"></path>
                      <path d="M20 10l0 11"></path>
                      <path d="M8 14l0 3"></path>
                      <path d="M12 14l0 3"></path>
                      <path d="M16 14l0 3"></path>
                    </svg>
                    Payments
                  </li>
                  <li class="menu-item">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="opacity-75"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M7 9m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z"></path>
                      <path d="M14 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
                      <path d="M17 9v-2a2 2 0 0 0 -2 -2h-10a2 2 0 0 0 -2 2v6a2 2 0 0 0 2 2h2"></path>
                    </svg>
                    Balances
                  </li>
                  <li class="menu-item">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="opacity-75"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path>
                      <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      <path d="M21 21v-2a4 4 0 0 0 -3 -3.85"></path>
                    </svg>
                    Customers
                  </li>
                  <li class="menu-item">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="opacity-75"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M7 10l5 -6l5 6"></path>
                      <path d="M21 10l-2 8a2 2.5 0 0 1 -2 2h-10a2 2.5 0 0 1 -2 -2l-2 -8z"></path>
                      <path d="M12 15m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
                    </svg>
                    Products
                  </li>
                  <li>
                    <input type="checkbox" id="menu-2" class="menu-toggle" />
                    <label class="menu-item justify-between" for="menu-2">
                      <div class="flex gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="opacity-75"
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          fill="none"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path
                            stroke="none"
                            d="M0 0h24v24H0z"
                            fill="none"
                          ></path>
                          <path d="M15 21h-9a3 3 0 0 1 -3 -3v-1h10v2a2 2 0 0 0 4 0v-14a2 2 0 1 1 2 2h-2m2 -4h-11a3 3 0 0 0 -3 3v11"></path>
                          <path d="M9 7l4 0"></path>
                          <path d="M9 11l4 0"></path>
                        </svg>
                        <span>Contracts</span>
                      </div>

                      <span class="menu-icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </span>
                    </label>

                    <div class="menu-item-collapse">
                      <div class="min-h-0">
                        <label class="menu-item menu-item-disabled ml-6">
                          Create contract
                        </label>
                        <label class="menu-item ml-6">All contracts</label>
                        <label class="menu-item ml-6">Pending contracts</label>
                        <label class="menu-item ml-6">Security</label>
                      </div>
                    </div>
                  </li>
                </ul>
              </section> */}
              </nav>
            </section>
          </aside>
        </div>
        <div class="flex w-full flex-col overflow-auto border-slate-800 rounded-lg sm:border-2 p-4 max-h-full">
          <div class="w-fit p-2 block sm:hidden">
            <label for="sidebar-mobile-fixed" class="btn-primary btn sm:hidden">
              Buka Sidebar
            </label>
          </div>
          {props.children}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
