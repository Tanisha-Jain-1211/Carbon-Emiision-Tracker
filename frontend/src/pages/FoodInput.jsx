import React, { useState } from 'react';

const FoodInput = () => {
  const [foodInputs, setFoodInputs] = useState(['']);
  const [message, setMessage] = useState('');

  // Today's date in YYYY-MM-DD format
  const today = new Date().toISOString().slice(0, 10);

  const handleInputChange = (index, value) => {
    const updated = [...foodInputs];
    updated[index] = value;
    setFoodInputs(updated);
  };

  const addFoodField = () => {
    setFoodInputs([...foodInputs, '']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const items = foodInputs.map(item => item.trim()).filter(Boolean);

    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/food`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date: today, items }),
    });

    if (res.ok) {
      setMessage('✅ Food data submitted successfully');
      setFoodInputs(['']);
    } else {
      setMessage('❌ Failed to submit food data');
    }
  };

  return (
    <div className="page">
      <h2>🥗 Daily Food Input</h2>
      <form onSubmit={handleSubmit}>
        <p><strong>Date:</strong> {today}</p>

        {foodInputs.map((food, idx) => (
          <div key={idx} style={{ marginBottom: '10px' }}>
            <input
              type="text"
              value={food}
              onChange={(e) => handleInputChange(idx, e.target.value)}
              placeholder="e.g., Paneer, Pasta, Salad"
              required
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
        ))}

        <button type="button" onClick={addFoodField} style={buttonStyle}>➕ Add More Food</button>
        <br />
        <button type="submit" style={{ ...buttonStyle, backgroundColor: '#007BFF', color: '#fff' }}>✅ Submit</button>
      </form>

      {message && <p style={{ marginTop: '15px' }}>{message}</p>}
    </div>
  );
};

const buttonStyle = {
  padding: '10px 14px',
  margin: '10px 5px 0 0',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: 'pink',
  cursor: 'pointer',
};

export default FoodInput;
