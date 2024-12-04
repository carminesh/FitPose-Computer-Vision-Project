import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";

import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { countSquats } from "./squatCounter";
import { countPushups } from "./pushUpCounter";

function PoseTrackingApp() {
  const [squatStatus, setSquatStatus] = useState("");
  const [exercType, setExercType] = useState("");
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { exerciseType } = location.state || {};
  const [status, setStatus] = useState("");

  const cameraRef = useRef(null); // To keep track of the camera instance
  const [squatData, setSquatData] = useState({
    squatCount: 0,
    squatFlag: false,
  });
  const [pushupData, setPushupData] = useState({
    pushupCount: 0,
    pushupFlag: false,
  });

  

  const checkSquatPosition = (landmarks) => {
    const hipLeft = landmarks[23];
    const hipRight = landmarks[24];
    const kneeLeft = landmarks[25];
    const kneeRight = landmarks[26];
    const ankleLeft = landmarks[27];
    const ankleRight = landmarks[28];

    const hipsLowerThanKnees =
      hipLeft.y > kneeLeft.y && hipRight.y > kneeRight.y;

    const kneesInFrontOfAnkles =
      kneeLeft.y < ankleLeft.y && kneeRight.y < ankleRight.y;

    
    if (hipsLowerThanKnees && kneesInFrontOfAnkles) {
      setSquatStatus("Correct position");
    } else {
      setSquatStatus("Incorrect position");
    }
  };

  const checkPushUpPosition = (landmarks) => {
    const shoulderLeft = landmarks[11];
    const shoulderRight = landmarks[12];
    const hipLeft = landmarks[23];
    const hipRight = landmarks[24];
    const elbowLeft = landmarks[13];
    const elbowRight = landmarks[14];

    const leftElbowAngle = calculateAngle(shoulderLeft, elbowLeft, hipLeft);
    const rightElbowAngle = calculateAngle(shoulderRight, elbowRight, hipRight);

    const isAligned = Math.abs(hipLeft.y - shoulderLeft.y) < 0.1;

    if (leftElbowAngle < 100 && rightElbowAngle < 100 && isAligned) {
      setStatus("Correct Push-Up");
    } else {
      setStatus("Incorrect Push-Up");
    }
  };

  const calculateAngle = (p1, p2, p3) => {
    const dx1 = p1.x - p2.x;
    const dy1 = p1.y - p2.y;
    const dx2 = p3.x - p2.x;
    const dy2 = p3.y - p2.y;
    const dotProduct = dx1 * dx2 + dy1 * dy2;
    const magnitude1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const magnitude2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    const angle = Math.acos(dotProduct / (magnitude1 * magnitude2));
    return (angle * 180) / Math.PI;
  };

  const onResults = (results) => {
    if (!results.poseLandmarks) return;

    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    drawLandmarks(canvasCtx, results.poseLandmarks, {
      color: "#FF0000",
      lineWidth: 0.1,
    });

    drawLandmarks(canvasCtx, results.poseLandmarks, {
      color: "#FF0000",
      lineWidth: 0.1,
    });

    const bodyConnections = [
      [11, 13],
      [13, 15],
      [12, 14],
      [14, 16],
      [11, 12],
      [11, 23],
      [12, 24],
      [23, 25],
      [25, 27],
      [24, 26],
      [26, 28],
      [23, 24],
      [27, 29],
      [28, 30],
    ];

    bodyConnections.forEach(([start, end]) => {
      const startLandmark = results.poseLandmarks[start];
      const endLandmark = results.poseLandmarks[end];

      canvasCtx.beginPath();
      canvasCtx.moveTo(
        startLandmark.x * canvasElement.width,
        startLandmark.y * canvasElement.height
      );
      canvasCtx.lineTo(
        endLandmark.x * canvasElement.width,
        endLandmark.y * canvasElement.height
      );
      canvasCtx.strokeStyle = "#FFFFFF";
      canvasCtx.lineWidth = 2;
      canvasCtx.stroke();
    });

    setExercType(exerciseType);
    if (exerciseType === "Squat") {

      checkSquatPosition(results.poseLandmarks);
      
      setSquatData(prevState => {
        const newState = countSquats(results.poseLandmarks, prevState);
        //console.log("Stato aggiornato:", newState);
        return newState;
      });

    } else if (exerciseType === "PushUp") {
      setPushupData(prevState => {
        const newState = countPushups(results.poseLandmarks, prevState);
        //console.log("Stato aggiornato:", newState);
        return newState;
      });
    }

    canvasCtx.restore();

  };

  
  useEffect(() => {
    let pose;
    let cameraInitialized = false;

    const initializeCamera = () => {
      if (webcamRef.current && webcamRef.current.video.readyState === 4) {
        if (!cameraInitialized) {
          cameraRef.current = new cam.Camera(webcamRef.current.video, {
            onFrame: async () => {
              await pose.send({ image: webcamRef.current.video });
            },
            width: 640,
            height: 480,
          });
          cameraRef.current.start();
          cameraInitialized = true;
        }
      } else {
        // Retry initialization after 100ms if webcam video is not ready
        setTimeout(initializeCamera, 100);
      }
    };

    pose = new Pose({locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
    }});
    
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);
    initializeCamera();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
    };
  }, [exerciseType]);

  useEffect(() => {
    if (squatData.squatCount > 0) {
      console.log("squatData: ", squatData.squatCount);
    }

    if (pushupData.pushupCount > 0) {
      console.log("pushupData: ", pushupData.pushupCount);
    }
  }, [squatData, pushupData]);

 // Function to stop the webcam
  const stopWebcam = () => {
    cameraRef.current.stop();
    cameraRef.current = null;
  };

  const resetState = () => {
    stopWebcam(); // ferma la webcam se attiva
    navigate("/");
  };


  return (
    <div
      className="App"
      style={{
        position: "relative",
        width: 640,
        height: 480,
        margin: "auto",
        textAlign: "center",
      }}
    >
      <button
        onClick={() => resetState()}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 10,
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Back
      </button>
      <Webcam
        ref={webcamRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      />
      <canvas
        ref={canvasRef}
        className="output_canvas"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 2,
        }}
      ></canvas>
      <div
        style={{
          position: "absolute",
          bottom: "-130px",
          width: "100%",
          textAlign: "center",
          color: "black",
          fontSize: "24px",
          zIndex: 3,
        }}
      >
        <p>{exerciseType} Analysis</p>
        {squatStatus && <p>{squatStatus}</p>}
        {status && <p>{status}</p>}
        <div
        style={{
          position: "absolute",
          top: "-75px",
          left: "1px",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "white",
          padding: "10px 15px",
          borderRadius: "5px",
          fontSize: "18px",
        }}
        >
          {exercType === "Squat" ? (
            <p>{squatData.squatCount}</p>
          ) : (
            <p>{pushupData.pushupCount}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PoseTrackingApp;