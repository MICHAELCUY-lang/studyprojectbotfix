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
    console.log("Notification permission:", permission);
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
      const publicVapidKey =
        "BCk3AFWYjlWh1lfGSBo05iE_lbgnrPT4QcLsBZdvnDo0m2pPaztBA_Yu9glLqxeDMqtWFKxHiCTYQsQTU0DXUzI";

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      // Simpan subscription di localStorage karena kita tidak memiliki backend
      saveSubscriptionToLocalStorage(subscription);
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

    // Hapus subscription dari localStorage
    if (result) {
      removeSubscriptionFromLocalStorage();
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
    console.warn("Notifications are not supported in this browser");
    return { status: "unsupported" };
  }

  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted");
    return { status: "permission-denied" };
  }

  try {
    // Default options
    const defaultOptions = {
      icon: "/logo192.png",
      badge: "/logo192.png",
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

// Schedule notification untuk tugas menggunakan local storage
export const scheduleTaskNotification = async (task, minutesBefore = 30) => {
  if (!task.dueDate || !task.reminder) return null;

  try {
    const dueDate = new Date(task.dueDate);

    // Hitung waktu notifikasi (X menit sebelum deadline)
    const notificationTime = new Date(dueDate);
    notificationTime.setMinutes(notificationTime.getMinutes() - minutesBefore);

    // Jika waktu notifikasi sudah lewat, jangan jadwalkan
    if (notificationTime <= new Date()) {
      return null;
    }

    // Simpan jadwal notifikasi di localStorage
    const scheduledNotifications = getScheduledNotifications();

    // Hapus notifikasi yang sudah ada untuk tugas ini
    const filteredNotifications = scheduledNotifications.filter(
      (n) => n.taskId !== task.id || n.type !== "deadline"
    );

    // Tambahkan notifikasi baru
    filteredNotifications.push({
      taskId: task.id,
      type: "deadline", // Tambahkan tipe untuk membedakan jenis notifikasi
      title: `Deadline untuk tugas "${task.title}" dalam ${minutesBefore} menit`,
      body: `Tugas ini jatuh tempo pada ${dueDate.toLocaleString()}`,
      scheduledTime: notificationTime.getTime(),
      url: `/tasks/${task.id}`,
    });

    // Simpan kembali ke localStorage
    saveScheduledNotifications(filteredNotifications);

    // Jika service worker aktif, register notifikasi
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        // Kirim pesan ke service worker untuk memeriksa jadwal
        registration.active.postMessage({
          type: "CHECK_SCHEDULED_NOTIFICATIONS",
        });
      });
    }

    return true;
  } catch (error) {
    console.error("Error scheduling task notification:", error);
    return null;
  }
};

// Jadwalkan pengingat harian untuk tugas
export const scheduleDailyReminder = async (task, hour = 9, minute = 0) => {
  if (!task.reminder) return null;

  try {
    // Buat jadwal notifikasi untuk besok pada jam yang ditentukan
    const now = new Date();
    const scheduledTime = new Date(now);

    // Set waktu ke besok jika waktu hari ini sudah lewat
    scheduledTime.setDate(now.getDate() + (now.getHours() >= hour ? 1 : 0));
    scheduledTime.setHours(hour, minute, 0, 0);

    // Simpan jadwal notifikasi di localStorage
    const scheduledNotifications = getScheduledNotifications();

    // Hapus pengingat harian yang sudah ada untuk tugas ini
    const filteredNotifications = scheduledNotifications.filter(
      (n) => n.taskId !== task.id || n.type !== "daily"
    );

    // Tambahkan notifikasi baru
    filteredNotifications.push({
      taskId: task.id,
      type: "daily",
      title: `Pengingat Harian: ${task.title}`,
      body: `Jangan lupa untuk mengerjakan tugas ini. ${
        task.dueDate
          ? `Deadline: ${new Date(task.dueDate).toLocaleDateString()}`
          : ""
      }`,
      scheduledTime: scheduledTime.getTime(),
      url: `/tasks/${task.id}`,
      recurrence: {
        type: "daily",
        hour: hour,
        minute: minute,
      },
    });

    // Simpan kembali ke localStorage
    saveScheduledNotifications(filteredNotifications);

    return true;
  } catch (error) {
    console.error("Error scheduling daily reminder:", error);
    return null;
  }
};

// Jadwalkan pengingat dengan interval waktu tertentu (dalam jam)
export const scheduleIntervalReminder = async (task, intervalHours = 10) => {
  if (!task.reminder) return null;

  try {
    // Buat jadwal notifikasi untuk intervalHours jam dari sekarang
    const now = new Date();
    const scheduledTime = new Date(
      now.getTime() + intervalHours * 60 * 60 * 1000
    );

    // Simpan jadwal notifikasi di localStorage
    const scheduledNotifications = getScheduledNotifications();

    // Hapus pengingat interval yang sudah ada untuk tugas ini
    const filteredNotifications = scheduledNotifications.filter(
      (n) => n.taskId !== task.id || n.type !== "interval"
    );

    // Tambahkan notifikasi baru
    filteredNotifications.push({
      taskId: task.id,
      type: "interval",
      title: `Pengingat: ${task.title}`,
      body: `Sudah ${intervalHours} jam sejak pengingat terakhir. ${
        task.dueDate
          ? `Deadline: ${new Date(task.dueDate).toLocaleDateString()}`
          : ""
      }`,
      scheduledTime: scheduledTime.getTime(),
      url: `/tasks/${task.id}`,
      recurrence: {
        type: "interval",
        hours: intervalHours,
      },
    });

    // Simpan kembali ke localStorage
    saveScheduledNotifications(filteredNotifications);

    return true;
  } catch (error) {
    console.error("Error scheduling interval reminder:", error);
    return null;
  }
};

// Batalkan semua notifikasi yang dijadwalkan untuk tugas
export const cancelTaskNotification = (taskId) => {
  try {
    // Ambil notifikasi yang dijadwalkan
    const scheduledNotifications = getScheduledNotifications();

    // Filter out all notifications for this task
    const filteredNotifications = scheduledNotifications.filter(
      (n) => n.taskId !== taskId
    );

    // Simpan kembali ke localStorage
    saveScheduledNotifications(filteredNotifications);

    return true;
  } catch (error) {
    console.error("Error cancelling task notifications:", error);
    return false;
  }
};

// Batalkan notifikasi spesifik berdasarkan taskId dan tipe
export const cancelSpecificNotification = (taskId, notificationType) => {
  try {
    // Ambil notifikasi yang dijadwalkan
    const scheduledNotifications = getScheduledNotifications();

    // Filter out specific notification type for this task
    const filteredNotifications = scheduledNotifications.filter(
      (n) => n.taskId !== taskId || n.type !== notificationType
    );

    // Simpan kembali ke localStorage
    saveScheduledNotifications(filteredNotifications);

    return true;
  } catch (error) {
    console.error(`Error cancelling ${notificationType} notifications:`, error);
    return false;
  }
};

// Periksa notifikasi yang sudah dijadwalkan
export const checkScheduledNotifications = () => {
  const now = Date.now();
  const scheduledNotifications = getScheduledNotifications();
  const notificationsToShow = [];
  const remainingNotifications = [];

  // Cek notifikasi yang waktunya sudah tiba
  scheduledNotifications.forEach((notification) => {
    if (notification.scheduledTime <= now) {
      notificationsToShow.push(notification);

      // Jika notifikasi memiliki recurrence (berulang), jadwalkan ulang
      if (notification.recurrence) {
        const newNotification = { ...notification };

        // Hitung waktu berikutnya berdasarkan tipe pengulangan
        if (notification.recurrence.type === "daily") {
          // Set ke besok pada jam yang sama
          const nextTime = new Date();
          nextTime.setDate(nextTime.getDate() + 1);
          nextTime.setHours(
            notification.recurrence.hour,
            notification.recurrence.minute,
            0,
            0
          );
          newNotification.scheduledTime = nextTime.getTime();
        } else if (notification.recurrence.type === "interval") {
          // Set ke interval jam berikutnya dari sekarang
          const intervalMs = notification.recurrence.hours * 60 * 60 * 1000;
          newNotification.scheduledTime = now + intervalMs;
        }

        // Tambahkan ke remaining notifications untuk dijadwalkan ulang
        remainingNotifications.push(newNotification);
      }
    } else {
      remainingNotifications.push(notification);
    }
  });

  // Simpan notifikasi yang tersisa
  saveScheduledNotifications(remainingNotifications);

  // Tampilkan notifikasi yang waktunya sudah tiba
  notificationsToShow.forEach((notification) => {
    showNotification(notification.title, {
      body: notification.body,
      data: { url: notification.url },
    });
  });

  return notificationsToShow.length;
};

// Helper function untuk mengubah base64 string ke Uint8Array
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

// Helper untuk menyimpan subscription di localStorage
function saveSubscriptionToLocalStorage(subscription) {
  localStorage.setItem(
    "push_subscription",
    JSON.stringify(subscription.toJSON())
  );
}

// Helper untuk menghapus subscription dari localStorage
function removeSubscriptionFromLocalStorage() {
  localStorage.removeItem("push_subscription");
}

// Helper untuk mendapatkan notifikasi yang dijadwalkan dari localStorage
function getScheduledNotifications() {
  try {
    return JSON.parse(localStorage.getItem("scheduled_notifications") || "[]");
  } catch (error) {
    console.error("Error reading scheduled notifications:", error);
    return [];
  }
}

// Helper untuk menyimpan notifikasi yang dijadwalkan di localStorage
function saveScheduledNotifications(notifications) {
  localStorage.setItem(
    "scheduled_notifications",
    JSON.stringify(notifications)
  );
}

// Helper untuk mendapatkan pengaturan notifikasi dari localStorage
export function getNotificationSettings() {
  try {
    return JSON.parse(
      localStorage.getItem("notification_settings") ||
        JSON.stringify({
          deadlineEnabled: true,
          dailyEnabled: false,
          dailyHour: 9,
          dailyMinute: 0,
          intervalEnabled: false,
          intervalHours: 10,
        })
    );
  } catch (error) {
    console.error("Error reading notification settings:", error);
    return {
      deadlineEnabled: true,
      dailyEnabled: false,
      dailyHour: 9,
      dailyMinute: 0,
      intervalEnabled: false,
      intervalHours: 10,
    };
  }
}

// Helper untuk menyimpan pengaturan notifikasi di localStorage
export function saveNotificationSettings(settings) {
  localStorage.setItem("notification_settings", JSON.stringify(settings));
}
