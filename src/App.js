import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WorkoutSelection from "./pages/WorkoutSelection";
import ExerciseConfigPage from "./pages/ExerciseConfigPage";
import PoseTrackingApp from "./components/PoseTrackingApp";
import { CssBaseline } from "@mui/material";

function App() {
  return (
    <Router>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<WorkoutSelection />} />
        <Route path="/exercise-config" element={<ExerciseConfigPage />} />
        <Route path="/pose-tracking" element={<PoseTrackingApp />} />
      </Routes>
    </Router>
  );
}

export default App;