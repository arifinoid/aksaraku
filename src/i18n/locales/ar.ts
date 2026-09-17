import type { Dict } from "./types";

export const ar: Dict = {
  app: {
    name: "أكساراكو",
    tagline: "تعلّم أثناء اللعب",
  },
  common: {
    on: "مُفعّل",
    off: "متوقف",
    back: "رجوع",
    soon: "قريباً",
    loading: "لحظة من فضلك...",
  },
  nav: {
    parent: "الوالدان",
    home: "الرئيسية",
  },
  profiles: {
    title: "من سيلعب؟",
    subtitle: "اختر طفلاً أو أضف ملفاً جديداً",
    add: "إضافة طفل",
    namePlaceholder: "اسم الطفل",
    start: "ابدأ",
    empty: "لا توجد ملفات بعد. أضف طفلاً أولاً.",
    errors: {
      emptyName: "الاسم مطلوب",
      nameTooLong: "الاسم طويل جداً",
      invalidLocale: "لغة غير معروفة",
    },
  },
  home: {
    greeting: "مرحباً يا {{name}}!",
    tracing: "الكتابة",
    games: "الألعاب",
    rewards: "المجموعة",
    avatar: "الشخصية",
  },
  play: {
    title: "هيا نكتب",
    pick: "اختر حرفاً أو رقماً أو شكلاً",
    retry: "حاول مرة أخرى",
    next: "التالي",
    great: "أحسنت!",
    strokeProgress: "الخط {{current}} من {{total}}",
    offTrack: "اتبع الخط",
  },
  mastery: {
    new: "جديد",
    learning: "قيد التعلّم",
    familiar: "يتحسّن",
    mastered: "أتقن",
  },
  parent: {
    title: "منطقة الوالدين",
    gateTitle: "للوالدين فقط",
    gate: {
      question: "كم يساوي {{a}} + {{b}}؟",
      placeholder: "الإجابة",
      submit: "دخول",
      wrong: "الإجابة غير صحيحة",
      cancel: "إلغاء",
    },
    progress: "التقدّم",
    progressSoon: "ستظهر تقارير التقدّم هنا.",
    screenTime: "حد الوقت",
    sessionLimit: "حد الجلسة",
    settings: "الإعدادات",
    language: "اللغة",
    haptics: "الاهتزاز",
    audio: "الصوت",
    switchProfile: "تغيير الطفل",
  },
  settings: {
    errors: {
      invalidLocale: "لغة غير صالحة",
      invalidSessionLimit: "حد الجلسة غير صالح",
    },
  },
  error: {
    storage: "تعذّر حفظ البيانات. حاول مرة أخرى.",
  },
};
