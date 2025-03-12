import { useState, useEffect } from 'react';

export default function Home() {
  const [mode, setMode] = useState('');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  // 載入 public/data.json 資料庫
  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error('Error loading data.json:', err));
  }, []);

  // 選擇學習模式並根據模式篩選資料
  const startMode = (selectedMode) => {
    setMode(selectedMode);
    let filtered;
    if (selectedMode === '平假名') {
      filtered = data.filter(item => item.type === '平假名');
    } else if (selectedMode === '片假名') {
      filtered = data.filter(item => item.type === '片假名');
    } else {
      filtered = data;
    }
    setFilteredData(filtered);
    loadNewWord(filtered);
  };

  // 隨機抽取一筆資料
  const loadNewWord = (filtered = filteredData) => {
    setUserInput('');
    setFeedback('');
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
      setFeedback('正確！');
    } else {
      setFeedback(`錯誤！正確答案是： ${currentWord.romaji}`);
    }
    setShowAnswer(true);
  };

  const backToMenu = () => {
    setMode('');
    setFilteredData([]);
    setCurrentWord(null);
    setFeedback('');
    setUserInput('');
  };

  // 簡單的 inline CSS style
  const containerStyle = {
    maxWidth: '600px',
    margin: '20px auto',
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center'
  };

  const wordStyle = {
    margin: '20px 0'
  };

  const inputStyle = {
    padding: '8px',
    fontSize: '1em',
    width: '60%',
    marginRight: '10px'
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '1em',
    margin: '10px',
    cursor: 'pointer'
  };

  return (
    <div>
      {mode === '' ? (
        <div style={containerStyle}>
          <h1>選擇學習模式</h1>
          <button style={buttonStyle} onClick={() => startMode('平假名')}>平假名學習</button>
          <button style={buttonStyle} onClick={() => startMode('片假名')}>片假名學習</button>
          <button style={buttonStyle} onClick={() => startMode('混合')}>混合模式</button>
        </div>
      ) : (
        <div style={containerStyle}>
          <button style={buttonStyle} onClick={backToMenu}>返回選單</button>
          <h1>{mode} 學習</h1>
          {currentWord && (
            <div style={wordStyle}>
              {/* 顯示假名與漢字：若有漢字則上方為假名、下方為漢字；若無，則僅顯示假名在漢字區 */}
              {currentWord.kanji ? (
                <>
                  <p style={{fontSize: '1.8em', fontWeight: 'bold'}}>{currentWord.kana}</p>
                  <p style={{fontSize: '1.5em'}}>{currentWord.kanji}</p>
                </>
              ) : (
                <>
                  <p style={{fontSize: '1.8em', fontWeight: 'bold'}}></p>
                  <p style={{fontSize: '1.5em'}}>{currentWord.kana}</p>
                </>
              )}
              {/* 繁體中文解釋顯示於下方 */}
              <p style={{fontSize: '1.2em', marginTop: '10px'}}>{currentWord.meaning}</p>
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
            <button style={buttonStyle} onClick={checkAnswer}>檢查答案</button>
          </div>
          {showAnswer && (
            <div style={{fontSize: '1.5em', margin: '20px 0', color: '#333', whiteSpace: 'pre-line'}}>
              {feedback}<br/>
              {currentWord && currentWord.kanji ? (
                <>
                  {currentWord.kana}<br/>
                  {currentWord.kanji} ({currentWord.romaji})
                </>
              ) : (
                <>
                  {currentWord && currentWord.kana} ({currentWord.romaji})
                </>
              )}
            </div>
          )}
          {showAnswer && (
            <button style={buttonStyle} onClick={loadNewWord}>下一題</button>
          )}
        </div>
      )}
    </div>
  );
}
