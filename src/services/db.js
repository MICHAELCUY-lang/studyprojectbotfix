import Dexie from "dexie";

// Buat database instance
const db = new Dexie("StudyProjectBotDB");

// Definisikan skema database
db.version(1).stores({
  tasks:
    "++id, title, description, dueDate, priority, status, categoryId, createdAt, updatedAt",
  categories: "++id, name, color, icon",
  pomodoroSessions: "++id, taskId, startTime, endTime, duration, type",
  preferences: "id, themeMode, pomodoroSettings, musicPreferences",
  statistics: "++id, date, completedTasks, pomodoroCount, totalFocusTime",
});

// Model dan metode untuk Tasks
export const TasksModel = {
  // Mendapatkan semua task
  getAllTasks: () => db.tasks.toArray(),

  // Mendapatkan task berdasarkan ID
  getTaskById: (id) => db.tasks.get(id),

  // Mendapatkan task berdasarkan kategori
  getTasksByCategory: (categoryId) =>
    db.tasks.where("categoryId").equals(categoryId).toArray(),

  // Mendapatkan task berdasarkan status
  getTasksByStatus: (status) =>
    db.tasks.where("status").equals(status).toArray(),

  // Mendapatkan task yang akan jatuh tempo dalam n hari
  getUpcomingTasks: (days) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return db.tasks.where("dueDate").between(today, futureDate).toArray();
  },

  // Menambahkan task baru
  addTask: (task) => {
    const newTask = {
      ...task,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: task.status || "pending", // pending, in-progress, completed
    };

    return db.tasks.add(newTask);
  },

  // Mengupdate task
  updateTask: (id, task) => {
    return db.tasks.update(id, {
      ...task,
      updatedAt: new Date(),
    });
  },

  // Mengubah status task
  updateTaskStatus: (id, status) => {
    return db.tasks.update(id, {
      status,
      updatedAt: new Date(),
    });
  },

  // Menghapus task
  deleteTask: (id) => db.tasks.delete(id),
};

// Model dan metode untuk Categories
export const CategoriesModel = {
  // Mendapatkan semua kategori
  getAllCategories: () => db.categories.toArray(),

  // Mendapatkan kategori berdasarkan ID
  getCategoryById: (id) => db.categories.get(id),

  // Menambahkan kategori baru
  addCategory: (category) => db.categories.add(category),

  // Mengupdate kategori
  updateCategory: (id, category) => db.categories.update(id, category),

  // Menghapus kategori
  deleteCategory: (id) => db.categories.delete(id),
};

// Model dan metode untuk Pomodoro Sessions
export const PomodoroSessionsModel = {
  // Mendapatkan semua sesi pomodoro
  getAllSessions: () => db.pomodoroSessions.toArray(),

  // Mendapatkan sesi berdasarkan task
  getSessionsByTask: (taskId) =>
    db.pomodoroSessions.where("taskId").equals(taskId).toArray(),

  // Mendapatkan sesi berdasarkan rentang tanggal
  getSessionsByDateRange: (startDate, endDate) => {
    return db.pomodoroSessions
      .where("startTime")
      .between(startDate, endDate)
      .toArray();
  },

  // Menambahkan sesi baru
  addSession: (session) => {
    const newSession = {
      ...session,
      startTime: session.startTime || new Date(),
    };

    return db.pomodoroSessions.add(newSession);
  },

  // Menyelesaikan sesi yang sedang berjalan
  completeSession: (id, endTime = new Date()) => {
    return db.pomodoroSessions.get(id).then((session) => {
      const startTime = new Date(session.startTime);
      const duration = (endTime - startTime) / 1000; // dalam detik

      return db.pomodoroSessions.update(id, {
        endTime,
        duration,
      });
    });
  },

  // Menghapus sesi
  deleteSession: (id) => db.pomodoroSessions.delete(id),
};

// Model dan metode untuk Preferences
export const PreferencesModel = {
  // Mendapatkan semua preferensi
  getPreferences: () => db.preferences.get(1),

  // Mengupdate preferensi
  updatePreferences: (preferences) =>
    db.preferences.put({ id: 1, ...preferences }),

  // Mendapatkan pengaturan pomodoro
  getPomodoroSettings: () => {
    return db.preferences.get(1).then(
      (prefs) =>
        prefs?.pomodoroSettings || {
          workDuration: 25, // dalam menit
          shortBreakDuration: 5, // dalam menit
          longBreakDuration: 15, // dalam menit
          longBreakAfter: 4, // setelah berapa sesi
        }
    );
  },

  // Mengupdate pengaturan pomodoro
  updatePomodoroSettings: (settings) => {
    return db.preferences.get(1).then((prefs) => {
      const updatedPrefs = prefs || { id: 1 };
      updatedPrefs.pomodoroSettings = settings;
      return db.preferences.put(updatedPrefs);
    });
  },

  // Mendapatkan preferensi musik
  getMusicPreferences: () => {
    return db.preferences.get(1).then(
      (prefs) =>
        prefs?.musicPreferences || {
          workMusic: "focus",
          breakMusic: "relax",
          volume: 70,
          autoplay: true,
        }
    );
  },

  // Mengupdate preferensi musik
  updateMusicPreferences: (preferences) => {
    return db.preferences.get(1).then((prefs) => {
      const updatedPrefs = prefs || { id: 1 };
      updatedPrefs.musicPreferences = preferences;
      return db.preferences.put(updatedPrefs);
    });
  },
};

// Model dan metode untuk Statistics
export const StatisticsModel = {
  // Mendapatkan statistik berdasarkan tanggal
  getStatsByDate: (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return db.statistics.where("date").equals(dateStr).first();
  },

  // Mendapatkan statistik dalam rentang waktu
  getStatsByDateRange: (startDate, endDate) => {
    return db.statistics
      .where("date")
      .between(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      )
      .toArray();
  },

  // Menambahkan atau mengupdate statistik hari ini
  updateTodayStats: (stats) => {
    const today = new Date().toISOString().split("T")[0];

    return db.statistics
      .where("date")
      .equals(today)
      .first()
      .then((existingStats) => {
        if (existingStats) {
          return db.statistics.update(existingStats.id, {
            completedTasks:
              stats.completedTasks !== undefined
                ? stats.completedTasks
                : existingStats.completedTasks,
            pomodoroCount:
              stats.pomodoroCount !== undefined
                ? stats.pomodoroCount
                : existingStats.pomodoroCount,
            totalFocusTime:
              stats.totalFocusTime !== undefined
                ? stats.totalFocusTime
                : existingStats.totalFocusTime,
          });
        } else {
          return db.statistics.add({
            date: today,
            completedTasks: stats.completedTasks || 0,
            pomodoroCount: stats.pomodoroCount || 0,
            totalFocusTime: stats.totalFocusTime || 0,
          });
        }
      });
  },

  // Menambahkan task yang diselesaikan
  incrementCompletedTasks: async () => {
    const today = new Date().toISOString().split("T")[0];
    const stats = await db.statistics.where("date").equals(today).first();

    if (stats) {
      return db.statistics.update(stats.id, {
        completedTasks: stats.completedTasks + 1,
      });
    } else {
      return db.statistics.add({
        date: today,
        completedTasks: 1,
        pomodoroCount: 0,
        totalFocusTime: 0,
      });
    }
  },

  // Menambahkan sesi pomodoro yang diselesaikan
  incrementPomodoroCount: async () => {
    const today = new Date().toISOString().split("T")[0];
    const stats = await db.statistics.where("date").equals(today).first();

    if (stats) {
      return db.statistics.update(stats.id, {
        pomodoroCount: stats.pomodoroCount + 1,
      });
    } else {
      return db.statistics.add({
        date: today,
        completedTasks: 0,
        pomodoroCount: 1,
        totalFocusTime: 0,
      });
    }
  },

  // Menambahkan waktu fokus
  addFocusTime: async (minutes) => {
    const today = new Date().toISOString().split("T")[0];
    const stats = await db.statistics.where("date").equals(today).first();

    if (stats) {
      return db.statistics.update(stats.id, {
        totalFocusTime: stats.totalFocusTime + minutes,
      });
    } else {
      return db.statistics.add({
        date: today,
        completedTasks: 0,
        pomodoroCount: 0,
        totalFocusTime: minutes,
      });
    }
  },
};

// Inisialisasi data awal jika database kosong
export const initializeDatabase = async () => {
  // Cek apakah sudah ada kategori
  const categoriesCount = await db.categories.count();
  if (categoriesCount === 0) {
    // Tambahkan kategori default
    await db.categories.bulkAdd([
      { name: "Kuliah", color: "#4A00E0", icon: "school" },
      { name: "Pekerjaan", color: "#0077B6", icon: "work" },
      { name: "Pribadi", color: "#00B4D8", icon: "person" },
      { name: "Proyek", color: "#F72585", icon: "code" },
    ]);
  }

  // Inisialisasi preferensi default
  const preferences = await db.preferences.get(1);
  if (!preferences) {
    await db.preferences.put({
      id: 1,
      themeMode: "light",
      pomodoroSettings: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        longBreakAfter: 4,
      },
      musicPreferences: {
        workMusic: "focus",
        breakMusic: "relax",
        volume: 70,
        autoplay: true,
      },
    });
  }
};

// Ekspor database
export default db;
  