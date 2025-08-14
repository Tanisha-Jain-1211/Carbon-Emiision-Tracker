import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Share = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [totalCO2, setTotalCO2] = useState(0);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchScores();
  }, [month]);

  const fetchScores = async () => {
    const types = ["food", "travel", "electricity", "lifestyle"];
    const pieData = [];
    let total = 0;

    for (const type of types) {
      const res = await fetch(`http://localhost:8000/api/${type}/month/${month}`, {
        credentials: "include",
      });
      if (res.ok) {
        const items = await res.json();
        let value = 0;

        if (type === "food") value = items.length * 2.5;
        if (type === "travel") value = items.reduce((sum, e) => sum + e.distance_km * 0.21, 0);
        if (type === "electricity") value = items.reduce((sum, e) => sum + e.units * 0.85, 0);
        if (type === "lifestyle") value = items.length * 1;

        total += value;
        pieData.push({
          name: type.charAt(0).toUpperCase() + type.slice(1),
          value: parseFloat(value.toFixed(2)),
        });
      }
    }

    setTotalCO2(total.toFixed(2));
    setData(pieData);
  };

  const getGreenScore = () => {
    if (totalCO2 < 100) return "🌿 Excellent (Green Score: A+)";
    if (totalCO2 < 200) return "✅ Good (Green Score: B)";
    if (totalCO2 < 300) return "⚠️ Average (Green Score: C)";
    return "❌ High Emissions (Green Score: D)";
  };

  const shareMessage = `My Green Score for ${month}: ${getGreenScore()} — Total CO₂: ${totalCO2} kg`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareMessage);
    alert("Shared text copied to clipboard!");
  };

  const downloadBadge = () => {
    const element = document.getElementById("green-badge");
    html2canvas(element).then((canvas) => {
      const link = document.createElement("a");
      link.download = "green-badge.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Green Score Report`, 10, 10);
    doc.text(`Month: ${month}`, 10, 20);
    doc.text(`Total CO₂: ${totalCO2} kg`, 10, 30);
    doc.text(`Score: ${getGreenScore()}`, 10, 40);
    doc.save("green-score-report.pdf");
  };

  const shareUrl = "http://localhost:5173/share";

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "30px",
        fontFamily: "'Segoe UI', sans-serif",
        background: "#f9fdfd",
        borderRadius: "16px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.05)",
      }}
    >
      <h2 style={{ fontSize: "2rem", color: "#00796b", marginBottom: "20px" }}>
        🌎 Share Your Green Score
      </h2>

      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        style={{
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "20px",
          width: "100%",
          fontSize: "1rem",
        }}
      />

      <div
        id="green-badge"
        style={{
          background: "#e0f7fa",
          padding: "20px",
          borderRadius: "12px",
          border: "2px dashed #00796b",
          textAlign: "center",
          color: "#004d40",
          marginBottom: "20px",
        }}
      >
        <p style={{ fontWeight: "500", fontSize: "1rem" }}>{shareMessage}</p>
        <h3 style={{ fontSize: "1.4rem", color: "#00695c", marginTop: "10px" }}>
          {getGreenScore()}
        </h3>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <button
          onClick={copyToClipboard}
          style={{
            padding: "10px 20px",
            backgroundColor: "#00796b",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📋 Copy & Share
        </button>
        <button
          onClick={downloadBadge}
          style={{
            padding: "10px 20px",
            backgroundColor: "#00796b",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📥 Download Badge
        </button>
        <button
          onClick={exportPDF}
          style={{
            padding: "10px 20px",
            backgroundColor: "#00796b",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📄 Export as PDF
        </button>
      </div>

      {/* Social Media Share Icons aligned in a row */}
      <div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: "2rem",
  }}
>
  <FacebookShareButton url={shareUrl} quote={shareMessage}>
    <FacebookIcon size={40} round style={{ margin: "0 5px" }} /> {/* Adjusted margin */}
  </FacebookShareButton>
  <TwitterShareButton url={shareUrl} title={shareMessage}>
    <TwitterIcon size={40} round style={{ margin: "0 5px" }} /> {/* Adjusted margin */}
  </TwitterShareButton>
  <WhatsappShareButton url={shareUrl} title={shareMessage}>
    <WhatsappIcon size={40} round style={{ margin: "0 5px" }} /> {/* Adjusted margin */}
  </WhatsappShareButton>
</div>




      {/* Emission Breakdown Chart: Centered and Enlarged */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "2rem",
        }}
      >
        <div style={{ maxWidth: "100%", padding: "20px", width: "500px" }}>
          <h3 style={{ marginBottom: "10px", color: "#00796b" }}>Emission Breakdown</h3>
          <PieChart width={500} height={400}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={150}
              fill="#8884d8"
              label
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>
    </div>
  );
};

export default Share;
