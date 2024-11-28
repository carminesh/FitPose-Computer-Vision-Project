import React from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import WorkoutSelection from "../src/pages/WorkoutSelection.jsx";
import PoseTrackingApp from "../src/components/PoseTrackingApp.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WorkoutSelection />} />
        <Route path="/pose-tracking" element={<PoseTrackingApp />} />
      </Routes>
    </Router>
  );
}

export default App;