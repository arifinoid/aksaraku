export const id = {
  app: {
    name: "Aksaraku",
    tagline: "Belajar sambil bermain",
  },
  common: {
    on: "Nyala",
    off: "Mati",
    back: "Kembali",
    soon: "Segera hadir",
    loading: "Sebentar ya...",
  },
  nav: {
    parent: "Orang Tua",
    home: "Beranda",
  },
  profiles: {
    title: "Siapa yang mau main?",
    subtitle: "Pilih anak atau tambah profil baru",
    add: "Tambah Anak",
    namePlaceholder: "Nama anak",
    start: "Mulai",
    empty: "Belum ada profil. Yuk tambah anak dulu.",
    errors: {
      emptyName: "Nama belum diisi",
      nameTooLong: "Nama terlalu panjang",
      invalidLocale: "Bahasa tidak dikenal",
    },
  },
  home: {
    greeting: "Halo, {{name}}!",
    tracing: "Menulis",
    games: "Permainan",
    rewards: "Koleksi",
    avatar: "Karakter",
  },
  play: {
    title: "Ayo Menulis",
    comingSoon: "Modul menulis sedang disiapkan.",
  },
  parent: {
    title: "Area Orang Tua",
    gateTitle: "Khusus Orang Tua",
    gate: {
      question: "Berapa hasil dari {{a}} + {{b}}?",
      placeholder: "Jawaban",
      submit: "Masuk",
      wrong: "Jawaban belum tepat",
      cancel: "Batal",
    },
    progress: "Perkembangan",
    progressSoon: "Laporan perkembangan akan tampil di sini.",
    screenTime: "Batas Waktu",
    sessionLimit: "Batas sesi",
    settings: "Pengaturan",
    language: "Bahasa",
    haptics: "Getaran",
    audio: "Suara",
    switchProfile: "Ganti Anak",
  },
  settings: {
    errors: {
      invalidLocale: "Bahasa tidak valid",
      invalidSessionLimit: "Batas sesi tidak valid",
    },
  },
  error: {
    storage: "Gagal menyimpan data. Coba lagi ya.",
  },
} as const;
