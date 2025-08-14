import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useEmission } from "../context/EmissionContext";

const Track = () => {
  const { refreshKey } = useEmission();

  const [goal, setGoal] = useState("");
  const [currentCO2, setCurrentCO2] = useState(0);
  const [futurePlans, setFuturePlans] = useState([{ id: 1, value: "", estimate: null }]);
  const [totalEstimate, setTotalEstimate] = useState(0);
  const [alerts, setAlerts] = useState(false);
  const [emissionData, setEmissionData] = useState([]);
  const [todayEmission, setTodayEmission] = useState(null);

  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const month = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    fetchMonthlyData();
    fetchTodayEmission();
  }, [goal, refreshKey]);

  useEffect(() => {
    const total = futurePlans.reduce((sum, plan) => sum + (plan.estimate || 0), 0);
    setTotalEstimate(Number(total.toFixed(2)));
  }, [futurePlans]);

  const fetchMonthlyData = async () => {
    const types = ["food", "travel", "electricity", "lifestyle"];
    let total = 0;
    let graphData = [];

    for (const type of types) {
      const res = await fetch(`http://localhost:8000/api/${type}/month/${month}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        let value = 0;

        if (type === "food") value = data.length * 2.5;
        if (type === "travel") value = data.reduce((sum, e) => sum + e.distance_km * 0.21, 0);
        if (type === "electricity") value = data.reduce((sum, e) => sum + e.units * 0.85, 0);
        if (type === "lifestyle") value = data.length * 1;

        total += value;
        graphData.push({
          name: type.charAt(0).toUpperCase() + type.slice(1),
          value: parseFloat(value.toFixed(2)),
        });
      }
    }

    setCurrentCO2(total.toFixed(2));
    setEmissionData(graphData);
    setAlerts(goal !== "" && total > goal);
  };

  const fetchTodayEmission = async () => {
    const types = ["food", "travel", "electricity", "lifestyle"];
    let total = 0;
    const today = new Date().toISOString().slice(0, 10);

    for (const type of types) {
      const res = await fetch(`http://localhost:8000/api/${type}/day/${today}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        let value = 0;

        if (type === "food") value = data.length * 2.5;
        if (type === "travel") value = data.reduce((sum, e) => sum + e.distance_km * 0.21, 0);
        if (type === "electricity") value = data.reduce((sum, e) => sum + e.units * 0.85, 0);
        if (type === "lifestyle") value = data.length * 1;

        total += value;
      }
    }

    setTodayEmission(total.toFixed(2));
  };

  const handleChat = async () => {
    if (!chatInput) return;
    setChatLoading(true);
    setChatResponse("");

    try {
      const res = await fetch("https://api.magicapi.dev/api/v1/swift-api/gpt-3-5-turbo/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer cm9dahlqm0001lb0474s5tc7w",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: chatInput }],
        }),
      });

      const data = await res.json();

      if (res.ok && data.choices && data.choices.length > 0) {
        setChatResponse(data.choices[0].message.content.trim());
      } else {
        setChatResponse("⚠️ Error: Unexpected response format.");
      }
    } catch (error) {
      setChatResponse("⚠️ Error reaching chatbot API");
    } finally {
      setChatLoading(false);
    }
  };

  const estimateEmission = async (text, id) => {
    if (!text.trim()) return;

    try {
      const res = await fetch("https://api.magicapi.dev/api/v1/swift-api/gpt-3-5-turbo/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer cm9dahlqm0001lb0474s5tc7w",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are a carbon emissions calculator. Based on a given activity, respond ONLY with the estimated CO₂ emission in kilograms as a number (no units, no explanation).",
            },
            {
              role: "user",
              content: text,
            },
          ],
        }),
      });

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "0";
      const estimate = parseFloat(content.replace(/[^\d.]/g, ""));

      setFuturePlans((prev) =>
        prev.map((plan) =>
          plan.id === id ? { ...plan, estimate: isNaN(estimate) ? 0 : estimate } : plan
        )
      );
    } catch (err) {
      console.error("Estimation failed", err);
    }
  };

  const handleFutureChange = (index, value) => {
    const newPlans = [...futurePlans];
    newPlans[index].value = value;
    setFuturePlans(newPlans);
    estimateEmission(value, newPlans[index].id);
  };

  const addPlan = () => {
    setFuturePlans([...futurePlans, { id: Date.now(), value: "", estimate: null }]);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.leftPanel}>
        <h2 style={styles.title}>📈 Track Your Progress</h2>

        <label style={styles.label}>🎯 Set Monthly CO₂ Goal (kg)</label>
        <input
          type="number"
          value={goal}
          onChange={(e) => setGoal(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="e.g., 150"
          style={styles.input}
        />

<div style={{
  background: "#e8f8f5",
  padding: "20px",
  borderRadius: "16px",
  marginTop: "20px",
  border: "1px solid #b2dfdb",
  boxShadow: "0 2px 12px rgba(0,0,0,0.05)"
}}>
  <h3 style={{ fontSize: "1.3rem", color: "#00695c", marginBottom: "10px" }}>
    📝 Future Plans (with Estimated CO₂)
  </h3>
  {futurePlans.map((plan, index) => (
    <div key={plan.id} style={{ marginBottom: "14px" }}>
      <input
        type="text"
        placeholder="e.g., flight to NYC"
        value={plan.value}
        onChange={(e) => handleFutureChange(index, e.target.value)}
        style={styles.input}
      />
      {plan.estimate !== null && (
        <p style={{ fontSize: "0.9rem", color: "#333", marginTop: "4px" }}>
          Estimated CO₂: <strong>{plan.estimate} kg</strong>
        </p>
      )}
    </div>
  ))}
  <button style={styles.button} onClick={addPlan}>➕ Add Plan</button>

  <p style={{ fontSize: "1rem", fontWeight: "bold", marginTop: "10px", color: "#004d40" }}>
    Estimated Total Future CO₂: {totalEstimate} kg
  </p>
</div>


        <p style={styles.currentCO2}>
          <strong>Current Emission:</strong> {currentCO2} kg CO₂
        </p>

{alerts && (
  <div style={styles.alertBox}>
    ⚠️ You have exceeded your monthly CO₂ goal of <strong>{goal} kg</strong>!<br />
    Your current emission is <strong>{currentCO2} kg</strong>.
    <p style={{ marginTop: "8px", fontStyle: "italic" }}>Try reducing travel, electricity, or meat consumption 🌍</p>
  </div>
)}


        <h3 style={styles.subtitle}>🔁 Recurring Activities</h3>
        <BarChart width={420} height={250} data={emissionData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: "kg CO₂", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Bar dataKey="value" fill="#82ca9d" />
        </BarChart>

        <h3 ></h3>
        <button style={styles.button} onClick={fetchTodayEmission}>
          
        </button>
        {todayEmission !== null && (
          <p><strong></strong> {} </p>
        )}
      </div>

      <div style={styles.chatPanel}>
        <h3 style={styles.subtitle}>🤖 Eco Chatbot Assistant</h3>
        <textarea
          rows="4"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask how to reduce your carbon footprint..."
          style={styles.textarea}
        />
        <button style={styles.button} onClick={handleChat} disabled={chatLoading}>
          {chatLoading ? "Thinking..." : "💬 Get Suggestions"}
        </button>
        {chatResponse && (
          <div style={styles.chatResponse}>
            <strong>Bot:</strong><br />{chatResponse}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  // ... same as your original styles, unchanged
  wrapper: { display: "flex", gap: "30px", padding: "40px", maxWidth: "1200px", margin: "auto", fontFamily: "Segoe UI, sans-serif", flexWrap: "wrap" },
  leftPanel: { flex: 1.5, padding: "20px", background: "#f9fbff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", minWidth: "300px" },
  chatPanel: { flex: 1, padding: "20px", background: "#fffef5", border: "2px solid #f5eec2", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", minWidth: "280px" },
  title: { fontSize: "1.8rem", marginBottom: "20px", color: "#2c3e50" },
  subtitle: { marginTop: "25px", fontSize: "1.3rem", color: "#0a3d62" },
  label: { marginTop: "10px", display: "block", fontWeight: "bold", marginBottom: "5px" },
  input: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "10px", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", resize: "none", marginBottom: "15px", boxSizing: "border-box" },
  button: { padding: "10px 18px", background: "#0077b6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", marginTop: "8px" },
  alert: { color: "#d63031", fontWeight: "bold", marginTop: "10px" },
  currentCO2: { marginTop: "10px", fontSize: "1rem" },
  alertBox: {
  marginTop: "20px",
  backgroundColor: "#ffebee",
  borderLeft: "6px solid #c62828",
  padding: "16px",
  borderRadius: "8px",
  color: "#b71c1c",
  fontWeight: "bold",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
},

  chatResponse: { marginTop: "15px", padding: "20px", background: "#e3f2fd", borderRadius: "12px", whiteSpace: "pre-wrap", color: "#1a237e", fontFamily: "'Segoe UI', sans-serif", fontSize: "1rem", border: "1px solid #90caf9", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", maxWidth: "90%", wordWrap: "break-word", transition: "all 0.3s ease-in-out" },
};

export default Track;
