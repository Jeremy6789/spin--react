import React, { useState, useRef } from "react";
import "./style.css";

function App() {
  const [participants, setParticipants] = useState([]);
  const [winnerName, setWinnerName] = useState("");
  const [currentRotation, setCurrentRotation] = useState(0);
  const fileInputRef = useRef(null);

  // 匯入 CSV 並新增參加者
  const importCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return alert("未選擇任何檔案！");
    const reader = new FileReader();
    reader.onload = (event) => {
      const lines = event.target.result
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      setParticipants((prev) => [...prev, ...lines]);
    };
    reader.readAsText(file);
  };

  // 輸入框同步參加者資料
  const syncParticipants = (e) => {
    const names = e.target.value.split("\n").map((name) => name.trim()).filter(Boolean);
    setParticipants(names);
  };

  // 清除所有資料
  const clearData = () => {
    setParticipants([]);
    setWinnerName("");
  };

  // 計算中獎者索引
  const getWinnerIndex = (rotation) => {
    const segmentAngle = 360 / participants.length;
    const normalizedRotation = (rotation % 360 + 360) % 360;
    const pointerAngle = 90; // 假設指針位於正上方
    const correctedRotation = (normalizedRotation + pointerAngle) % 360;
    const reverseIndex = participants.length - 1 - Math.floor(correctedRotation / segmentAngle);
    return (reverseIndex + participants.length) % participants.length;
  };

  // 轉盤旋轉
  const spinWheel = () => {
    if (participants.length === 0) return alert("請先輸入或匯入參加名單！");
  
    const minSpins = 10; // 最少旋轉圈數
    const additionalRotation = Math.random() * 360; // 最後停下的額外角度
    const newRotation = minSpins * 360 + additionalRotation; // 本次旋轉的總角度
    const targetRotation = currentRotation + newRotation; // 最終目標角度
  
    // 更新狀態並重置動畫
    setCurrentRotation(targetRotation); // 更新狀態的總旋轉角度
  
    const wheelElement = document.querySelector(".wheel");
    wheelElement.style.transition = "none"; // 暫時禁用動畫
    wheelElement.style.transform = `rotate(${currentRotation % 360}deg)`; // 重置為當前角度
    void wheelElement.offsetHeight; // 強制觸發 DOM 重繪，確保動畫應用正確
  
    // 設置旋轉動畫
    wheelElement.style.transition = "transform 3.5s ease-out"; // 設置動畫時長和減速效果
    wheelElement.style.transform = `rotate(${targetRotation}deg)`; // 應用新的旋轉角度
  
    // 設置定時器，在旋轉結束後顯示中獎者
    setTimeout(() => {
      const winnerIndex = getWinnerIndex(targetRotation); // 計算中獎者索引
      setWinnerName(participants[winnerIndex]);
      alert(`恭喜 ${participants[winnerIndex]} 中獎！`);
    }, 3500); // 與動畫時間同步
  };
  
  
  
    
  return (
    <div className="container">
      
      <div className="main">
        <div className="wheel-section">
          <div
            className="wheel"
            style={{
              transform: `rotate(${currentRotation}deg)`,
              transition: "transform 4s ease-out",
            }}
          >
            <WheelCanvas participants={participants} />
          </div>
          <div className="pointer"></div>
          {winnerName && (
            <div className="winner-message">
              恭喜 <span>{winnerName}</span> !!
            </div>
          )}
        </div>
        <div className="list-section">
          <h3>建立抽獎名單:</h3>
          <div>
            目前人數: <span>{participants.length}</span>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            style={{ display: "none" }}
            onChange={importCSV}
          />
          <textarea
            id="dataInput"
            placeholder="請輸入參加者名單，每行一位"
            value={participants.join("\n")}
            onChange={(e) => {
             const input = e.target.value;
             setParticipants(input.split("\n")); // 分行同步更新狀態
           }}
          ></textarea>


          <button className="csv-button" onClick={() => fileInputRef.current.click()}>
            匯入CSV
          </button>
          <button className="clear-button" onClick={clearData}>
            清除資料
          </button>
          <button className="start-button" onClick={spinWheel}>
            開始抽獎
          </button>
        </div>
      </div>
    </div>
  );
}

// 繪製轉盤
function WheelCanvas({ participants }) {
  const canvasRef = useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const radius = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(radius, radius);
    const segmentAngle = 360 / participants.length;

    participants.forEach((name, index) => {
      const startAngle = (index * segmentAngle * Math.PI) / 180;
      const endAngle = ((index + 1) * segmentAngle * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.fillStyle = `hsl(${(index * 360) / participants.length}, 70%, 50%)`;
      ctx.fill();
      ctx.save();
      const textAngle = (startAngle + endAngle) / 2;
      ctx.rotate(textAngle);
      ctx.textAlign = "right";
      ctx.fillStyle = "#000";
      ctx.font = "18px Arial";
      ctx.fillText(name, radius - 10, 10);
      ctx.restore();
    });
    ctx.translate(-radius, -radius);
  }, [participants]);

  return <canvas ref={canvasRef} width={500} height={500}></canvas>;
}

export default App;
