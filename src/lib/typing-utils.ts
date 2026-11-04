export type FingerName =
  | "pinkyLeft"
  | "ringLeft"
  | "middleLeft"
  | "indexLeft"
  | "indexRight"
  | "middleRight"
  | "ringRight"
  | "pinkyRight"
  | "thumb";

export interface FingerInfo {
  name: FingerName;
  label: string;
  hand: "left" | "right";
  color: string;
}

export const FINGER_MAP: Record<FingerName, FingerInfo> = {
  pinkyLeft: { name: "pinkyLeft", label: "Left Pinky", hand: "left", color: "#FF6B6B" },
  ringLeft: { name: "ringLeft", label: "Left Ring", hand: "left", color: "#FF9F43" },
  middleLeft: { name: "middleLeft", label: "Left Middle", hand: "left", color: "#FECA57" },
  indexLeft: { name: "indexLeft", label: "Left Index", hand: "left", color: "#48DBFB" },
  indexRight: { name: "indexRight", label: "Right Index", hand: "right", color: "#1DD1A1" },
  middleRight: { name: "middleRight", label: "Right Middle", hand: "right", color: "#54A0FF" },
  ringRight: { name: "ringRight", label: "Right Ring", hand: "right", color: "#5F27CD" },
  pinkyRight: { name: "pinkyRight", label: "Right Pinky", hand: "right", color: "#FF78CB" },
  thumb: { name: "thumb", label: "Thumbs", hand: "right", color: "#A8B2D1" },
};

export const KEY_TO_FINGER: Record<string, FingerName> = {
  // Left pinky
  "`": "pinkyLeft", "~": "pinkyLeft",
  "1": "pinkyLeft", "!": "pinkyLeft",
  "q": "pinkyLeft", "Q": "pinkyLeft",
  "a": "pinkyLeft", "A": "pinkyLeft",
  "z": "pinkyLeft", "Z": "pinkyLeft",
  "Tab": "pinkyLeft", "CapsLock": "pinkyLeft", "ShiftLeft": "pinkyLeft",

  // Left ring
  "2": "ringLeft", "@": "ringLeft",
  "w": "ringLeft", "W": "ringLeft",
  "s": "ringLeft", "S": "ringLeft",
  "x": "ringLeft", "X": "ringLeft",

  // Left middle
  "3": "middleLeft", "#": "middleLeft",
  "e": "middleLeft", "E": "middleLeft",
  "d": "middleLeft", "D": "middleLeft",
  "c": "middleLeft", "C": "middleLeft",

  // Left index
  "4": "indexLeft", "$": "indexLeft",
  "5": "indexLeft", "%": "indexLeft",
  "r": "indexLeft", "R": "indexLeft",
  "t": "indexLeft", "T": "indexLeft",
  "f": "indexLeft", "F": "indexLeft",
  "g": "indexLeft", "G": "indexLeft",
  "v": "indexLeft", "V": "indexLeft",
  "b": "indexLeft", "B": "indexLeft",

  // Right index
  "6": "indexRight", "^": "indexRight",
  "7": "indexRight", "&": "indexRight",
  "y": "indexRight", "Y": "indexRight",
  "u": "indexRight", "U": "indexRight",
  "h": "indexRight", "H": "indexRight",
  "j": "indexRight", "J": "indexRight",
  "n": "indexRight", "N": "indexRight",
  "m": "indexRight", "M": "indexRight",

  // Right middle
  "8": "middleRight", "*": "middleRight",
  "i": "middleRight", "I": "middleRight",
  "k": "middleRight", "K": "middleRight",
  ",": "middleRight", "<": "middleRight",

  // Right ring
  "9": "middleRight", "(": "middleRight",
  "o": "ringRight", "O": "ringRight",
  "l": "ringRight", "L": "ringRight",
  ".": "ringRight", ">": "ringRight",

  // Right pinky
  "0": "pinkyRight", ")": "pinkyRight",
  "-": "pinkyRight", "_": "pinkyRight",
  "=": "pinkyRight", "+": "pinkyRight",
  "p": "pinkyRight", "P": "pinkyRight",
  "[": "pinkyRight", "{": "pinkyRight",
  "]": "pinkyRight", "}": "pinkyRight",
  "\\": "pinkyRight", "|": "pinkyRight",
  ";": "pinkyRight", ":": "pinkyRight",
  "'": "pinkyRight", "\"": "pinkyRight",
  "/": "pinkyRight", "?": "pinkyRight",
  "Enter": "pinkyRight", "Backspace": "pinkyRight", "ShiftRight": "pinkyRight",

  // Thumbs
  " ": "thumb",
};

export function getFingerForKey(char: string): FingerInfo {
  const fingerKey = KEY_TO_FINGER[char] || "indexLeft";
  return FINGER_MAP[fingerKey];
}

export function requiresShift(char: string): boolean {
  if (char.length !== 1) return false;
  const isUpperLetter = char >= "A" && char <= "Z";
  const shiftedSymbols = '~!@#$%^&*()_+{}|:"<>?';
  return isUpperLetter || shiftedSymbols.includes(char);
}

export function getRequiredShiftHand(char: string): "left" | "right" | null {
  if (!requiresShift(char)) return null;
  const finger = getFingerForKey(char);
  // Opposite hand rule:
  // If target key is pressed by left hand -> use Right Shift
  // If target key is pressed by right hand -> use Left Shift
  return finger.hand === "left" ? "right" : "left";
}

export function calculateWpm(correctChars: number, seconds: number): number {
  if (seconds <= 0) return 0;
  const minutes = seconds / 60;
  const words = correctChars / 5;
  return Math.round((words / minutes) * 10) / 10;
}

export function calculateGrossWpm(totalKeystrokes: number, seconds: number): number {
  if (seconds <= 0) return 0;
  const minutes = seconds / 60;
  const words = totalKeystrokes / 5;
  return Math.round((words / minutes) * 10) / 10;
}

export function calculateAccuracy(correctKeystrokes: number, totalKeystrokes: number): number {
  if (totalKeystrokes <= 0) return 100;
  const acc = (correctKeystrokes / totalKeystrokes) * 100;
  return Math.min(100, Math.max(0, Math.round(acc * 10) / 10));
}

