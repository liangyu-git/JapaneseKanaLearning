"use client";

import { useState, useEffect } from "react";

type Word = {
  type: string;
  kanji: string;
  kana: string;
  romaji: string;
  meaning: string;
};

export default function Page() {
  const [mode, setMode] = useState<string>("");
  const [data, setData] = useState<Word[]>([]);
  const [filteredData, setFilteredData] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [userInput, setUserInput] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  // 從 public 資料夾中載入 data.json
  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data: Word[]) => setData(data))
      .catch((err) => console.error("Error loading data.json:", err));
  }, []);

  // 選擇學習模式，並根據模式過濾資料
  const startMode = (selectedMode: string) => {
    setMode(selectedMode);
    let filtered: Word[];
    if (selectedMode === "平假名") {
      filtered = data.filter((item) => item.type === "平假名");
    } else if (selectedMode === "片假名") {
      filtered = data.filter((item) => item.type === "片假名");
    } else {
      filtered = data;
    }
    setFilteredData(filtered);
    loadNewWord(filtered);
  };

  // 隨機抽取一筆資料
  const loadNewWord = (filtered: Word[] = filteredData) => {
    setUserInput("");
    setFeedback("");
    setShowAnswer(false);
    if (filtered.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filtered.length);
    setCurrentWord(filtered[randomIndex]);
  };

  // 檢查使用者輸入的羅馬拼音
  const checkAnswer = () => {
    if (!currentWord) return;
    const userAns = userInput.trim().toLowerCase();
    const correct = currentWord.romaji.toLowerCase();
    if (userAns === correct) {
      setFeedback("正確！");
    } else {
      setFeedback(`錯誤！正確答案是： ${currentWord.romaji}`);
    }
    setShowAnswer(true);
  };

  const backToMenu = () => {
    setMode("");
    setFilteredData([]);
    setCurrentWord(null);
    setFeedback("");
    setUserInput("");
  };

  // inline CSS styles
  const containerStyle = {
    maxWidth: "600px",
    margin: "20px auto",
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center" as const,
  };

  const wordStyle = {
    margin: "20px 0",
  };

  const inputStyle = {
    padding: "8px",
    fontSize: "1em",
    width: "60%",
    marginRight: "10px",
  };

  const buttonStyle = {
    padding: "10px 20px",
    fontSize: "1em",
    margin: "10px",
    cursor: "pointer",
  };

  return (
    <div>
      {mode === "" ? (
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
      ) : (
        <div style={containerStyle}>
          <button style={buttonStyle} onClick={backToMenu}>
            返回選單
          </button>
          <h1>{mode} 學習</h1>
          {currentWord && (
            <div style={wordStyle}>
              {/* 若有漢字，則上方顯示假名，下方顯示漢字；若無，則只在漢字區顯示假名 */}
              {currentWord.kanji ? (
                <>
                  <p style={{ fontSize: "1.8em", fontWeight: "bold" }}>
                    {currentWord.kana}
                  </p>
                  <p style={{ fontSize: "1.5em" }}>{currentWord.kanji}</p>
                </>
              ) : (
                <>
                  <p style={{ fontSize: "1.8em", fontWeight: "bold" }}></p>
                  <p style={{ fontSize: "1.5em" }}>{currentWord.kana}</p>
                </>
              )}
              {/* 繁體中文解釋 */}
              <p style={{ fontSize: "1.2em", marginTop: "10px" }}>
                {currentWord.meaning}
              </p>
            </div>
          )}
          <div>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="請輸入羅馬拼音"
              style={inputStyle}
            />
            <button style={buttonStyle} onClick={checkAnswer}>
              檢查答案
            </button>
          </div>
          {showAnswer && (
            <div
              style={{
                fontSize: "1.5em",
                margin: "20px 0",
                color: "#333",
                whiteSpace: "pre-line",
              }}
            >
              {feedback}
              <br />
              {currentWord ? (
                currentWord.kanji ? (
                  <>
                    {currentWord.kana}
                    <br />
                    {currentWord.kanji} ({currentWord.romaji})
                  </>
                ) : (
                  <>
                    {currentWord.kana} ({currentWord.romaji})
                  </>
                )
              ) : null}
            </div>
          )}
          {showAnswer && (
            <button style={buttonStyle} onClick={loadNewWord}>
              下一題
            </button>
          )}
        </div>
      )}
    </div>
  );
}
