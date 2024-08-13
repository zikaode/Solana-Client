// components/Toast.jsx
export function Toast({ message }) {
  return (
    <div
      class={`fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md transition-opacity duration-500 ${
        message ? "opacity-100" : "opacity-0"
      }`}
    >
      {message}
    </div>
  );
}
