import React from "react";
import { useNavigate } from "react-router-dom";

function WorkoutSelection() {
  const navigate = useNavigate();

  const handleWorkoutSelection = (exerciseType) => {
    navigate("/pose-tracking", { state: { exerciseType } });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Select a Workout to Analyze</h1>
      <button
        style={{ padding: "10px 20px", margin: "20px", fontSize: "18px" }}
        onClick={() => handleWorkoutSelection("Squat")}
      >
        Squat
      </button>
      <button
        style={{ padding: "10px 20px", margin: "20px", fontSize: "18px" }}
        onClick={() => handleWorkoutSelection("PushUp")}
      >
        Push-Up
      </button>
    </div>
  );
}

export default WorkoutSelection;