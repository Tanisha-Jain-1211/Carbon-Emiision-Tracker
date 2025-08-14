import React, { useState } from "react";
import { useEmission } from "../context/EmissionContext";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const ORS_API_KEY = "5b3ce3597851110001cf62485ede8e2a4f4d411ebbf0df4c29d55780";

const TravelInput = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState("car"); // Default mode is car
  const [coordinates, setCoordinates] = useState([]);
  const [distanceKm, setDistanceKm] = useState(null);
  const { triggerRefresh } = useEmission();

  const geocode = async (place) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
    );
    const data = await res.json();
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  };

  const getRoute = async (srcCoords, destCoords) => {
    const body = {
      coordinates: [srcCoords.reverse(), destCoords.reverse()], // Reverse to lon,lat
    };

    const res = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
      method: "POST",
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    const lineCoords = data.features[0].geometry.coordinates.map((c) => [c[1], c[0]]);
    const dist = data.features[0].properties.summary.distance / 1000; // meters to km
    return { lineCoords, dist };
  };

  const calculateEmission = (distance) => {
    if (mode === "car") return (distance * 0.21).toFixed(2);
    if (mode === "flight") return (distance * 0.115).toFixed(2);
    if (mode === "bus") return (distance * 0.05).toFixed(2);
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];

    try {
      const srcCoords = await geocode(source);
      const destCoords = await geocode(destination);
      const { lineCoords, dist } = await getRoute(srcCoords, destCoords);
      setCoordinates(lineCoords);
      setDistanceKm(dist);

      // Calculate CO2 emissions based on selected mode
      const emissions = calculateEmission(dist);

      // Submit to backend
      const res = await fetch("http://localhost:8000/api/travel", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          mode: mode,
          distance_km: dist,
          emissions: emissions, // Add emissions to the payload
        }),
      });

      if (res.ok) {
        alert(`🎉 Travel data submitted! Emissions: ${emissions} kg CO₂`);
        triggerRefresh();
      } else {
        alert("⚠️ Failed to submit travel data");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error calculating route");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-yellow-50 rounded-3xl shadow-xl mt-10">
      <div>
        <h2 className="text-3xl font-bold text-green-700 mb-6">🌍 Log Your Travel</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Enter Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-green-400 rounded-xl shadow-md text-green-900 placeholder-green-600 focus:outline-none focus:ring-4 focus:ring-green-300"
          />
          <input
            type="text"
            placeholder="Enter Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-green-400 rounded-xl shadow-md text-green-900 placeholder-green-600 focus:outline-none focus:ring-4 focus:ring-green-300"
          />
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full px-4 py-3 border-2 border-green-400 rounded-xl shadow-md text-green-900 placeholder-green-600 focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            <option value="car">Car</option>
            <option value="flight">Flight</option>
            <option value="bus">Bus</option>
          </select>
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition duration-300"
          >
            Calculate & Log
          </button>
          {distanceKm && (
            <div className="mt-4 text-green-700 font-semibold">
              🛣️ Distance: {distanceKm.toFixed(2)} km
              <p>🌱 Estimated Emission: {calculateEmission(distanceKm)} kg CO₂</p>
            </div>
          )}
        </form>
      </div>

      <div>
        <MapContainer
          center={[20, 78]}
          zoom={4}
          style={{ height: "400px", borderRadius: "1rem" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {coordinates.length > 0 && <Polyline positions={coordinates} color="green" />}
        </MapContainer>
      </div>
    </div>
  );
};

export default TravelInput;
