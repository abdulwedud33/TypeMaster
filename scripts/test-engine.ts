import {
  calculateWpm,
  calculateGrossWpm,
  calculateAccuracy,
  requiresShift,
  getRequiredShiftHand,
  getFingerForKey,
  KEY_TO_FINGER,
} from "../src/lib/typing-utils";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✓ ${msg}`);
  }
}

console.log("--- TESTING TYPING UTILS ---");

// Test 1: Finger mapping for 9 and (
assert(KEY_TO_FINGER["9"] === "ringRight", "Key 9 is on ringRight");
assert(KEY_TO_FINGER["("] === "ringRight", "Key ( is on ringRight");
assert(KEY_TO_FINGER["8"] === "middleRight", "Key 8 is on middleRight");
assert(KEY_TO_FINGER["*"] === "middleRight", "Key * is on middleRight");

// Test 2: Shift Requirements
assert(requiresShift("A") === true, "Letter A requires shift");
assert(requiresShift("a") === false, "Letter a does NOT require shift");
assert(requiresShift("!") === true, "Symbol ! requires shift");
assert(requiresShift("1") === false, "Number 1 does NOT require shift");
assert(requiresShift(" ") === false, "Space does NOT require shift");
assert(requiresShift("?") === true, "Symbol ? requires shift");

// Test 3: Opposite Hand Shift Rules
assert(getRequiredShiftHand("A") === "right", "Shift for A is right hand");
assert(getRequiredShiftHand("P") === "left", "Shift for P is left hand");
assert(getRequiredShiftHand("!") === "right", "Shift for ! is right hand");
assert(getRequiredShiftHand("?") === "left", "Shift for ? is left hand");

// Test 4: WPM Formula
assert(calculateWpm(50, 60) === 10, "50 chars in 60s is 10 WPM");
assert(calculateWpm(250, 60) === 50, "250 chars in 60s is 50 WPM");
assert(calculateWpm(100, 0) === 0, "0 seconds returns 0 WPM");

// Test 5: Accuracy
assert(calculateAccuracy(100, 100) === 100, "100/100 is 100%");
assert(calculateAccuracy(95, 100) === 95, "95/100 is 95%");
assert(calculateAccuracy(0, 0) === 100, "0 keystrokes returns 100%");

console.log("\n--- SIMULATING ENGINE KEYSTROKE ACCURACY & ERROR TRACKING ---");

interface EngineSimState {
  targetText: string;
  typedChars: string[];
  totalKeystrokes: number;
  totalErrorsMade: number;
  backspaceCount: number;
  mistypedKeys: Record<string, number>;
  correctKeys: Record<string, number>;
}

function createSim(targetText: string): EngineSimState {
  return {
    targetText,
    typedChars: [],
    totalKeystrokes: 0,
    totalErrorsMade: 0,
    backspaceCount: 0,
    mistypedKeys: {},
    correctKeys: {},
  };
}

function pressKey(sim: EngineSimState, key: string) {
  if (key === "Backspace") {
    sim.backspaceCount += 1;
    if (sim.typedChars.length > 0) {
      sim.typedChars.pop();
    }
    return;
  }

  // Printable key
  if (key.length === 1) {
    sim.totalKeystrokes += 1;
    const currentIndex = sim.typedChars.length;
    const expected = sim.targetText[currentIndex];
    const isCorrect = key === expected;

    if (isCorrect) {
      sim.correctKeys[key] = (sim.correctKeys[key] || 0) + 1;
    } else {
      sim.totalErrorsMade += 1;
      if (expected) {
        sim.mistypedKeys[expected] = (sim.mistypedKeys[expected] || 0) + 1;
      }
    }
    sim.typedChars.push(key);
  }
}

function getMetrics(sim: EngineSimState, durationSeconds: number) {
  let finalCorrectChars = 0;
  let uncorrectedErrors = 0;

  for (let i = 0; i < sim.typedChars.length; i++) {
    if (sim.typedChars[i] === sim.targetText[i]) {
      finalCorrectChars++;
    } else {
      uncorrectedErrors++;
    }
  }

  const correctedErrors = sim.totalErrorsMade - uncorrectedErrors;
  const accuracy = sim.totalKeystrokes > 0
    ? Math.round(((sim.totalKeystrokes - sim.totalErrorsMade) / sim.totalKeystrokes) * 1000) / 10
    : 100;
  const wpm = calculateWpm(finalCorrectChars, durationSeconds);
  const grossWpm = calculateGrossWpm(sim.totalKeystrokes, durationSeconds);

  return {
    finalCorrectChars,
    uncorrectedErrors,
    correctedErrors,
    totalErrorsMade: sim.totalErrorsMade,
    totalKeystrokes: sim.totalKeystrokes,
    backspaceCount: sim.backspaceCount,
    accuracy,
    wpm,
    grossWpm,
  };
}

// Simulation A: Perfect typing "Hello, World 2026!"
const simA = createSim("Hello, World 2026!");
for (const char of "Hello, World 2026!") {
  pressKey(simA, char);
}
const mA = getMetrics(simA, 10);
assert(mA.finalCorrectChars === 18, "Sim A: 18 correct chars");
assert(mA.totalErrorsMade === 0, "Sim A: 0 errors made");
assert(mA.correctedErrors === 0, "Sim A: 0 corrected errors");
assert(mA.uncorrectedErrors === 0, "Sim A: 0 uncorrected errors");
assert(mA.accuracy === 100, "Sim A: 100% accuracy");
assert(mA.wpm === calculateWpm(18, 10), "Sim A: WPM correct");

// Simulation B: Mistake corrected with Backspace:
// Target "cat". Types 'c', 'x' (error), Backspace, 'a', 't'
const simB = createSim("cat");
pressKey(simB, "c");
pressKey(simB, "x"); // Error
pressKey(simB, "Backspace");
pressKey(simB, "a");
pressKey(simB, "t");
const mB = getMetrics(simB, 5);
assert(mB.finalCorrectChars === 3, "Sim B: Final text has 3 correct chars");
assert(mB.totalErrorsMade === 1, "Sim B: Exactly 1 total error was made");
assert(mB.correctedErrors === 1, "Sim B: Exactly 1 error was corrected");
assert(mB.uncorrectedErrors === 0, "Sim B: 0 uncorrected errors remain");
assert(mB.backspaceCount === 1, "Sim B: 1 Backspace used");
assert(mB.totalKeystrokes === 4, "Sim B: 4 character keystrokes");
// Accuracy: (4 - 1)/4 = 75%
assert(mB.accuracy === 75, `Sim B: Accuracy is 75% (got ${mB.accuracy}%)`);

// Simulation C: Uncorrected error at end:
// Target "cat". Types 'c', 'a', 'r' (no backspace)
const simC = createSim("cat");
pressKey(simC, "c");
pressKey(simC, "a");
pressKey(simC, "r");
const mC = getMetrics(simC, 5);
assert(mC.finalCorrectChars === 2, "Sim C: 2 correct chars");
assert(mC.totalErrorsMade === 1, "Sim C: 1 error made");
assert(mC.correctedErrors === 0, "Sim C: 0 corrected errors");
assert(mC.uncorrectedErrors === 1, "Sim C: 1 uncorrected error");
assert(mC.accuracy === 66.7, `Sim C: Accuracy is 66.7% (got ${mC.accuracy}%)`);

// Simulation D: Rapid typing with multiple consecutive corrections on same key:
// Target "dog". Types 'd', 'z', Backspace, 'x', Backspace, 'o', 'g'
const simD = createSim("dog");
pressKey(simD, "d");
pressKey(simD, "z");
pressKey(simD, "Backspace");
pressKey(simD, "x");
pressKey(simD, "Backspace");
pressKey(simD, "o");
pressKey(simD, "g");
const mD = getMetrics(simD, 5);
assert(mD.finalCorrectChars === 3, "Sim D: 3 correct chars");
assert(mD.totalErrorsMade === 2, "Sim D: 2 errors made");
assert(mD.correctedErrors === 2, "Sim D: 2 corrected errors");
assert(mD.uncorrectedErrors === 0, "Sim D: 0 uncorrected errors");
assert(mD.backspaceCount === 2, "Sim D: 2 backspaces");
assert(mD.totalKeystrokes === 5, "Sim D: 5 character keystrokes");
// Accuracy: (5 - 2)/5 = 60%
assert(mD.accuracy === 60, `Sim D: Accuracy is 60% (got ${mD.accuracy}%)`);

console.log("\nAll simulation tests passed with 100% mathematical precision!");
