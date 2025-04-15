// Cek apakah service worker didukung oleh browser
const isServiceWorkerSupported = "serviceWorker" in navigator;

export function register() {
  if (isServiceWorkerSupported && process.env.NODE_ENV === "production") {
    window.addEventListener("load", () => {
      const swUrl = `${process.env.PUBLIC_URL}/serviceWorker.js`;

      registerValidSW(swUrl);

      // Tambahkan listener untuk update service worker
      window.addEventListener("updateServiceWorker", () => {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.update();
          }
        });
      });
    });
  }
}

function registerValidSW(swUrl) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      // Service worker berhasil terdaftar
      console.log("Service Worker registered with scope:", registration.scope);

      // Setup update handler
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // New service worker available
              console.log("New content is available; please refresh.");

              // Tampilkan notifikasi update ke pengguna
              const updateNotification = document.createElement("div");
              updateNotification.className = "update-notification";
              updateNotification.innerHTML = `
                <p>Versi baru aplikasi tersedia!</p>
                <button id="update-button">Update Sekarang</button>
              `;
              document.body.appendChild(updateNotification);

              document
                .getElementById("update-button")
                .addEventListener("click", () => {
                  // Hapus notifikasi
                  document.body.removeChild(updateNotification);

                  // Refresh halaman untuk mengaktifkan service worker baru
                  window.location.reload();
                });
            } else {
              // Service worker pertama kali terinstall
              console.log("Content is cached for offline use.");
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error("Error during service worker registration:", error);
    });
}

export function unregister() {
  if (isServiceWorkerSupported) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
