"use client";

import { useState, useEffect, useRef } from "react";

type Word = {
  type: string;
  kanji: string;
  kana: string;
  romaji: string;
  meaning: string;
};

type IncorrectItem = {
  question: Word;
  userAnswer: string;
};

export default function Page() {
  const [phase, setPhase] = useState<string>("modeSelection");
  const [mode, setMode] = useState<string>("");
  const [data, setData] = useState<Word[]>([]);
  const [filteredData, setFilteredData] = useState<Word[]>([]);
  const [sessionQuestions, setSessionQuestions] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [incorrectList, setIncorrectList] = useState<IncorrectItem[]>([]);
  const [questionCountInput, setQuestionCountInput] = useState<string>("");
  const [confirmDisabled, setConfirmDisabled] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load data from public/data.json
  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data: Word[]) => setData(data))
      .catch((err) => console.error("Error loading data.json:", err));
  }, []);

  // Mode selection: filter data and move to setup phase
  const startMode = (selectedMode: string) => {
    setMode(selectedMode);
    let filtered: Word[] = [];
    if (selectedMode === "平假名") {
      filtered = data.filter((item) => item.type === "平假名");
    } else if (selectedMode === "片假名") {
      filtered = data.filter((item) => item.type === "片假名");
    } else {
      filtered = data;
    }
    setFilteredData(filtered);
    setPhase("setup");
  };

  // Set up the session with a specified number of non-repeating questions
  const startSession = () => {
    const count = parseInt(questionCountInput);
    if (isNaN(count) || count <= 0) {
      alert("請輸入有效的題目數量");
      return;
    }
    const total = Math.min(count, filteredData.length);
    const shuffled = [...filteredData].sort(() => Math.random() - 0.5);
    const session = shuffled.slice(0, total);
    setSessionQuestions(session);
    setCurrentIndex(0);
    setIncorrectList([]);
    setPhase("practice");
    setShowAnswer(false);
    setConfirmDisabled(false);
    setUserInput("");
    setFeedback("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Move to the next question (or review phase if finished)
  const nextQuestion = () => {
    if (currentIndex + 1 >= sessionQuestions.length) {
      setPhase("review");
    } else {
      setCurrentIndex(currentIndex + 1);
      setUserInput("");
      setFeedback("");
      setShowAnswer(false);
      setConfirmDisabled(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  // Check answer, disable confirm button and show feedback with animation
  const checkAnswer = () => {
    if (!sessionQuestions[currentIndex]) return;
    const current = sessionQuestions[currentIndex];
    const userAns = userInput.trim().toLowerCase();
    const correct = current.romaji.toLowerCase();
    let resultFeedback = "";
    if (userAns === correct) {
      resultFeedback = "正確！";
    } else {
      resultFeedback = `錯誤！正確答案是： ${current.romaji}`;
      setIncorrectList((prev) => [...prev, { question: current, userAnswer: userInput }]);
    }
    setFeedback(resultFeedback);
    setShowAnswer(true);
    setConfirmDisabled(true);
  };

  // Return to main menu and reset state
  const backToMenu = () => {
    setPhase("modeSelection");
    setMode("");
    setFilteredData([]);
    setSessionQuestions([]);
    setCurrentIndex(0);
    setFeedback("");
    setUserInput("");
    setIncorrectList([]);
    setQuestionCountInput("");
    setShowAnswer(false);
    setConfirmDisabled(false);
  };

  // Handle keyboard events: Enter or Space to confirm or move to next question
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!showAnswer && !confirmDisabled) {
        checkAnswer();
      } else if (showAnswer) {
        nextQuestion();
      }
    }
  };

  // Styles for main container, card, input, button, tip, etc.
  const mainContainerStyle = {
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0f4ff, #d9e8ff)",
    color: "#000",
    padding: "10px",
    position: "relative" as const,
  };

  const containerStyle = {
    maxWidth: "600px",
    width: "100%",
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    textAlign: "center" as const,
    margin: "10px",
  };

  const wordStyle = {
    margin: "20px 0",
  };

  const inputStyle = {
    padding: "10px",
    fontSize: "1em",
    width: "60%",
    marginRight: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  };

  const buttonStyle = {
    padding: "10px 20px",
    fontSize: "1em",
    margin: "10px",
    cursor: "pointer",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#0070f3",
    color: "#fff",
    transition: "background-color 0.3s ease",
  };

  const tipStyle = {
    position: "fixed" as const,
    top: "10px",
    right: "10px",
    background: "#fff",
    padding: "8px 12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    fontSize: "0.9em",
    zIndex: 1000,
  };

  // Determine feedback color: green if correct, red if incorrect
  const feedbackColor =
    feedback.startsWith("正確") ? "#008000" : feedback.startsWith("錯誤") ? "#FF0000" : "#000";

  return (
    <div style={mainContainerStyle}>
      <div style={tipStyle}>
        提示：可多練習熟悉羅馬拼音，按 Enter 確認答案及進入下一題
      </div>
      {phase === "modeSelection" && (
        <div style={containerStyle}>
          <h1>選擇學習模式</h1>
          <button style={buttonStyle} onClick={() => startMode("平假名")}>
            平假名學習
          </button>
          <button style={buttonStyle} onClick={() => startMode("片假名")}>
            片假名學習
          </button>
          <button style={buttonStyle} onClick={() => startMode("混合")}>
            混合模式
          </button>
        </div>
      )}

      {phase === "setup" && (
        <div style={containerStyle}>
          <h1>{mode} 學習</h1>
          <p>請輸入本次練習的題目數量 (最多 {filteredData.length} 題)：</p>
          <input
            type="number"
            value={questionCountInput}
            onChange={(e) => setQuestionCountInput(e.target.value)}
            placeholder="題目數量"
            style={inputStyle}
          />
          <button style={buttonStyle} onClick={startSession}>
            開始練習
          </button>
          <button style={buttonStyle} onClick={backToMenu}>
            返回選單
          </button>
        </div>
      )}

      {phase === "practice" && sessionQuestions[currentIndex] && (
        <div style={containerStyle}>
          <button style={buttonStyle} onClick={backToMenu}>
            返回選單
          </button>
          <h1>
            {mode} 學習 - 題目 {currentIndex + 1} / {sessionQuestions.length}
          </h1>
          <div style={wordStyle}>
            {sessionQuestions[currentIndex].kanji ? (
              <>
                <p style={{ fontSize: "1.8em", fontWeight: "bold" }}>
                  {sessionQuestions[currentIndex].kana}
                </p>
                <p style={{ fontSize: "1.5em" }}>
                  {sessionQuestions[currentIndex].kanji}
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: "1.8em", fontWeight: "bold" }}></p>
                <p style={{ fontSize: "1.5em" }}>
                  {sessionQuestions[currentIndex].kana}
                </p>
              </>
            )}
            <p style={{ fontSize: "1.2em", marginTop: "10px" }}>
              {sessionQuestions[currentIndex].meaning}
            </p>
          </div>
          <div>
            <input
              type="text"
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="請輸入羅馬拼音"
              style={inputStyle}
            />
            <button style={buttonStyle} onClick={checkAnswer} disabled={confirmDisabled}>
              檢查答案
            </button>
          </div>
          {showAnswer && (
            <div
              className="feedback-animation"
              style={{
                fontSize: "1.5em",
                margin: "20px 0",
                color: feedbackColor,
                whiteSpace: "pre-line",
              }}
            >
              {feedback}
              <br />
              {sessionQuestions[currentIndex].kanji ? (
                <>
                  {sessionQuestions[currentIndex].kana}
                  <br />
                  {sessionQuestions[currentIndex].kanji} ({sessionQuestions[currentIndex].romaji})
                </>
              ) : (
                <>
                  {sessionQuestions[currentIndex].kana} ({sessionQuestions[currentIndex].romaji})
                </>
              )}
            </div>
          )}
          {showAnswer && (
            <button style={buttonStyle} onClick={nextQuestion}>
              下一題
            </button>
          )}
        </div>
      )}

      {phase === "review" && (
        <div style={containerStyle}>
          <h1>練習結束</h1>
          {incorrectList.length === 0 ? (
            <p>恭喜！全部答對！</p>
          ) : (
            <div>
              <h2>錯題回顧</h2>
              {incorrectList.map((item, index) => (
                <div
                  key={index}
                  style={{
                    margin: "10px 0",
                    border: "1px solid #ccc",
                    padding: "10px",
                    borderRadius: "4px",
                    textAlign: "left",
                  }}
                >
                  <p>
                    <strong>解釋：</strong> {item.question.meaning}
                  </p>
                  {item.question.kanji ? (
                    <>
                      <p>
                        <strong>假名：</strong> {item.question.kana}
                      </p>
                      <p>
                        <strong>漢字：</strong> {item.question.kanji}
                      </p>
                    </>
                  ) : (
                    <p>
                      <strong>假名：</strong> {item.question.kana}
                    </p>
                  )}
                  <p>
                    <strong>正確答案：</strong> {item.question.romaji}
                  </p>
                  <p>
                    <strong>你的答案：</strong> {item.userAnswer}
                  </p>
                </div>
              ))}
            </div>
          )}
          <button style={buttonStyle} onClick={backToMenu}>
            返回選單
          </button>
        </div>
      )}
      <style jsx global>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .feedback-animation {
          animation: fadeInScale 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
