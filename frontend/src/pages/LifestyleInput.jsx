import React, { useState } from "react";

const LifestyleInput = () => {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [habit, setHabit] = useState("");
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);

  const estimateEmission = async (text) => {
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
            content:
              "You are a carbon emissions calculator. Given a short lifestyle description, respond ONLY with the estimated CO₂ emission in kilograms as a number. Do not add units or explanation. Round to two decimals.",
          },
          {
            role: "user",
            content: text,
          },
        ],
      }),
    });

    const data = await res.json();
    const value = parseFloat(data.choices?.[0]?.message?.content);
    return isNaN(value) ? 0 : value;
  };

  const addHabit = async () => {
    if (!habit.trim()) return;
    setLoading(true);

    try {
      const emission = await estimateEmission(habit.trim());
      setHabits([...habits, { habit: habit.trim(), emission }]);
      setHabit("");
    } catch (error) {
      alert("Failed to estimate emission for this habit.");
    }

    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Prepare the data to send to the backend
    const data = {
      date,
      habits: habits.map((habit) => habit.habit),  // Send a list of habits
    };
  
    const res = await fetch("http://localhost:8000/api/lifestyle", {
      method: "POST",
      credentials: "include", // Ensure this is correct if you are using sessions
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  
    if (res.ok) {
      alert("Lifestyle data submitted!");
      setHabits([]); // Reset after submission
    } else {
      const errorData = await res.json();
      alert(`Failed to submit lifestyle data: ${errorData.detail}`);
    }
  };
  

  return (
    <div className="form-container">
      <h2>Log Lifestyle Habits</h2>
      <form onSubmit={handleSubmit}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <input
          type="text"
          placeholder="Habit (e.g. biking 5km, using plastic)"
          value={habit}
          onChange={e => setHabit(e.target.value)}
        />
        <button type="button" onClick={addHabit} disabled={loading}>
          {loading ? "Estimating..." : "Add Habit"}
        </button>

        <ul>
          {habits.map((h, i) => (
            <li key={i}>{h.habit} — {h.emission} kg CO₂</li>
          ))}
        </ul>

        <button type="submit" disabled={!habits.length}>Submit</button>
      </form>
    </div>
  );
};

export default LifestyleInput;
