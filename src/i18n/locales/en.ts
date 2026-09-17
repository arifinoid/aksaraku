import type { Dict } from "./types";

export const en: Dict = {
  app: {
    name: "Aksaraku",
    tagline: "Learn while playing",
  },
  common: {
    on: "On",
    off: "Off",
    back: "Back",
    soon: "Coming soon",
    loading: "Just a moment...",
  },
  nav: {
    parent: "Parents",
    home: "Home",
  },
  profiles: {
    title: "Who is playing?",
    subtitle: "Pick a child or add a new profile",
    add: "Add Child",
    namePlaceholder: "Child name",
    start: "Start",
    empty: "No profiles yet. Add a child first.",
    errors: {
      emptyName: "Name is required",
      nameTooLong: "Name is too long",
      invalidLocale: "Unknown language",
    },
  },
  home: {
    greeting: "Hi, {{name}}!",
    tracing: "Writing",
    games: "Games",
    rewards: "Collection",
    avatar: "Character",
  },
  play: {
    title: "Let's Write",
    pick: "Pick a letter, number, or shape",
    retry: "Try Again",
    next: "Next",
    great: "Great job!",
    strokeProgress: "Line {{current}} of {{total}}",
    offTrack: "Follow the line",
    listen: "Listen",
  },
  preview: {
    title: "Content Preview",
    hint: "Check the shape of every letter, number, and shape.",
  },
  categories: {
    upper: "Uppercase",
    lower: "Lowercase",
    digits: "Numbers",
    shapes: "Shapes",
  },
  mastery: {
    new: "New",
    learning: "Learning",
    familiar: "Getting there",
    mastered: "Mastered",
  },
  parent: {
    title: "Parent Area",
    gateTitle: "Parents Only",
    gate: {
      question: "What is {{a}} + {{b}}?",
      placeholder: "Answer",
      submit: "Enter",
      wrong: "That answer is not right",
      cancel: "Cancel",
    },
    progress: "Progress",
    progressSoon: "Progress reports will appear here.",
    screenTime: "Time Limit",
    sessionLimit: "Session limit",
    settings: "Settings",
    language: "Language",
    haptics: "Vibration",
    audio: "Sound",
    switchProfile: "Switch Child",
    preview: "Content Preview",
  },
  settings: {
    errors: {
      invalidLocale: "Invalid language",
      invalidSessionLimit: "Invalid session limit",
    },
  },
  error: {
    storage: "Could not save data. Please try again.",
  },
};
