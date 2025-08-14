import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user }) => (
  <nav>
    {user ? (
      <>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/food">Food</Link>
        <Link to="/travel">Travel</Link>
        <Link to="/electricity">Electricity</Link>
        <Link to="/lifestyle">Lifestyle</Link>
        <Link to="/share">Share</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        {/* <Link to="/future">Future Emission</Link> */}
        <Link to="/track">Track</Link>


        <span style={{ marginLeft: '8rem' }}>Welcome, {user.name}</span>
      </>
    ) : (
      <>
        <Link to="/">Login</Link>
        <Link to="/register">Register</Link>
      </>
    )}
  </nav>
);

export default Navbar;
