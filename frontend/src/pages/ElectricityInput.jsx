import React, { useState } from "react";

const ElectricityInput = () => {
  const [date, setDate] = useState("");
  const [units, setUnits] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/api/electricity", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        units: parseFloat(units)
      }),
    });
    if (res.ok) {
      alert("Electricity data submitted!");
      setDate("");
      setUnits("");
    } else {
      alert("Failed to submit electricity data");
    }
  };

  return (
    <div className="form-container">
      <h2>Log Electricity Usage</h2>
      <form onSubmit={handleSubmit}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <input type="number" placeholder="Units (kWh)" value={units} onChange={e => setUnits(e.target.value)} required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ElectricityInput;
