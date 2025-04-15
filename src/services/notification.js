// Cek apakah notifikasi didukung browser
export const isNotificationSupported = () => {
  return "Notification" in window;
};

// Cek apakah push notification didukung browser
export const isPushSupported = () => {
  return "PushManager" in window && "serviceWorker" in navigator;
};

// Minta izin notifikasi
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    return { status: "unsupported", permission: null };
  }

  try {
    const permission = await Notification.requestPermission();
    return { status: "success", permission };
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return { status: "error", error, permission: Notification.permission };
  }
};

// Mendaftarkan subscription push notification
export const subscribeToPushNotifications = async () => {
  if (!isPushSupported()) {
    return { status: "unsupported", subscription: null };
  }

  try {
    // Pastikan notifikasi diizinkan
    const permissionResult = await requestNotificationPermission();
    if (permissionResult.permission !== "granted") {
      return { status: "permission-denied", subscription: null };
    }

    // Dapatkan service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Dapatkan atau buat subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Buat subscription baru
      // CATATAN: Pada implementasi nyata, VAPID key sebaiknya diambil dari server
      // Ini hanya contoh key untuk tujuan pengembangan
      const publicVapidKey =
        "BLJkjRWVvD8pHdwUZEgrtMDxQg2jSeTeHKbWxYtgdqsDLgHIZaZYHFHx0v0rjzIpM_vEQGgQRMqjz_Baf_lKXzE";

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      // Simpan subscription di server
      await sendSubscriptionToServer(subscription);
    }

    return { status: "success", subscription };
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
    return { status: "error", error, subscription: null };
  }
};

// Batalkan subscription push notification
export const unsubscribeFromPushNotifications = async () => {
  if (!isPushSupported()) {
    return { status: "unsupported" };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return { status: "not-subscribed" };
    }

    // Batalkan subscription
    const result = await subscription.unsubscribe();

    // Hapus subscription dari server
    if (result) {
      await deleteSubscriptionFromServer(subscription);
    }

    return { status: "success", result };
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error);
    return { status: "error", error };
  }
};

// Tampilkan notifikasi lokal
export const showNotification = (title, options = {}) => {
  if (!isNotificationSupported()) {
    return { status: "unsupported" };
  }

  if (Notification.permission !== "granted") {
    return { status: "permission-denied" };
  }

  try {
    // Default options
    const defaultOptions = {
      icon: "/logo192.png",
      badge: "/badge.png",
      vibrate: [100, 50, 100],
      data: {
        url: window.location.origin,
      },
    };

    // Merge dengan options yang diberikan
    const notificationOptions = { ...defaultOptions, ...options };

    // Cek apakah service worker aktif
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      // Tampilkan notifikasi melalui service worker
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, notificationOptions);
      });
    } else {
      // Fallback ke notifikasi browser biasa
      new Notification(title, notificationOptions);
    }

    return { status: "success" };
  } catch (error) {
    console.error("Error showing notification:", error);
    return { status: "error", error };
  }
};

// Schedule notification untuk tugas
export const scheduleTaskNotification = async (task, minutesBefore = 30) => {
  if (!task.dueDate) return null;

  try {
    const dueDate = new Date(task.dueDate);

    // Hitung waktu notifikasi (X menit sebelum deadline)
    const notificationTime = new Date(dueDate);
    notificationTime.setMinutes(notificationTime.getMinutes() - minutesBefore);

    // Jika waktu notifikasi sudah lewat, jangan jadwalkan
    if (notificationTime <= new Date()) {
      return null;
    }

    // Untuk implementasi nyata, Anda sebaiknya menyimpan jadwal di server
    // dan menangani pengiriman notifikasi dari sana

    // Untuk sekarang, kita gunakan setTimeout sebagai contoh
    // (ini hanya akan bekerja selama browser terbuka)
    const timeUntilNotification = notificationTime.getTime() - Date.now();

    // Simpan timeout ID sehingga bisa dibatalkan jika diperlukan
    const timeoutId = setTimeout(() => {
      showNotification(
        `Deadline untuk tugas "${task.title}" dalam ${minutesBefore} menit`,
        {
          body: `Tugas ini jatuh tempo pada ${dueDate.toLocaleString()}`,
          data: {
            url: `/tasks/${task.id}`,
          },
        }
      );
    }, timeUntilNotification);

    return timeoutId;
  } catch (error) {
    console.error("Error scheduling task notification:", error);
    return null;
  }
};

// Helper function
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// Fungsi untuk mengirim subscription ke server
async function sendSubscriptionToServer(subscription) {
  // CATATAN: Ini hanya placeholder
  // Pada implementasi nyata, Anda akan mengirim subscription ke backend Anda
  console.log("Subscription untuk dikirim ke server:", subscription.toJSON());

  // Contoh implementasi:
  /*
  try {
    const response = await fetch('/api/push-subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription)
    });
    
    if (!response.ok) {
      throw new Error('Server error');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving subscription to server:', error);
    throw error;
  }
  */

  // Untuk saat ini, kita hanya return dummy success
  return { success: true };
}

// Fungsi untuk menghapus subscription dari server
async function deleteSubscriptionFromServer(subscription) {
  // CATATAN: Ini hanya placeholder
  // Pada implementasi nyata, Anda akan mengirim permintaan DELETE ke backend Anda
  console.log("Subscription untuk dihapus dari server:", subscription.toJSON());

  // Untuk saat ini, kita hanya return dummy success
  return { success: true };
}
