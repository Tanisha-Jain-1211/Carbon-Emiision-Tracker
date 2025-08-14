import React, { useEffect, useState } from "react";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/leaderboard", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setLeaders);
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🏆 Monthly Low-Carbon Leaderboard</h2>
      <table style={styles.table}>
        <thead>
          <tr style={styles.theadRow}>
            <th style={styles.th}>Rank</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Username</th>
            <th style={styles.th}>Total Emission (kg CO₂)</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((user, idx) => (
            <tr key={user.username} style={styles.tr}>
              <td style={styles.td}>
                <strong style={styles.rank}>{idx + 1}</strong>
              </td>
              <td style={styles.td}>{user.name}</td>
              <td style={styles.td}>{user.username}</td>
              <td style={styles.td}>{user.total_emission}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "30px",
    background: "#f5faff",
    borderRadius: "16px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
    fontFamily: "Segoe UI, sans-serif",
  },
  title: {
    textAlign: "center",
    fontSize: "2rem",
    color: "#2c3e50",
    marginBottom: "30px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#ffffff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 0 0 1px #e0e0e0",
  },
  theadRow: {
    backgroundColor: "green",
    color: "#ffffff",
    textAlign: "left",
  },
  th: {
    padding: "16px 20px",
    fontSize: "1rem",
    borderBottom: "2px solid #e0e0e0",
  },
  tr: {
    transition: "background 0.2s ease",
  },
  td: {
    padding: "14px 20px",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "1rem",
    color: "#333",
  },
  rank: {
    color: "#0077b6",
    fontWeight: "bold",
  },
};

export default Leaderboard;
