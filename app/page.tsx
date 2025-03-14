// Helper: Normalize romaji input by removing whitespace and converting alternative spellings
function normalizeRomaji(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/shi/g, "si")
    .replace(/chi/g, "ti")
    .replace(/tsu/g, "tu")
    .replace(/ji/g, "zi")
    .replace(/fu/g, "hu");
}

// In the checkAnswer function, use the normalization
const checkAnswer = () => {
  if (!sessionQuestions[currentIndex]) return;
  const current = sessionQuestions[currentIndex];
  // Normalize both user input and correct answer
  const normUser = normalizeRomaji(userInput);
  const normCorrect = normalizeRomaji(current.romaji);
  let resultFeedback = "";
  if (normUser === normCorrect) {
    resultFeedback = "正確！";
    setLastAnswerCorrect(true);
  } else {
    resultFeedback = `錯誤！正確答案是： ${current.romaji}`;
    setLastAnswerCorrect(false);
    if (phase === "practice") {
      setIncorrectList((prev) => [...prev, { question: current, userAnswer: normUser }]);
    } else if (phase === "repractice") {
      // Update latest answer for the reattempted word.
      setIncorrectList((prev) =>
        prev.map((item) =>
          item.question.romaji === current.romaji ? { question: current, userAnswer: normUser } : item
        )
      );
    }
  }
  setFeedback(resultFeedback);
  setShowAnswer(true);
  setConfirmDisabled(true);
};
