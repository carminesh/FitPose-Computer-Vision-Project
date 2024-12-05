import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { Pose } from '@mediapipe/pose';
import * as cam from '@mediapipe/camera_utils';
import { drawLandmarks } from '@mediapipe/drawing_utils';
import { Button, Typography } from '@mui/material';

function PoseTrackingApp() {
    const [squatStatus, setSquatStatus] = useState('');
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { exerciseType, reps } = location.state || {};
    const [status, setStatus] = useState('');
    const cameraRef = useRef(null);

    // Media query for mobile responsiveness
    const isMobile = window.innerWidth <= 768;

    const checkSquatPosition = (landmarks) => {
        const hipLeft = landmarks[23];
        const hipRight = landmarks[24];
        const kneeLeft = landmarks[25];
        const kneeRight = landmarks[26];
        const ankleLeft = landmarks[27];
        const ankleRight = landmarks[28];

        const hipsLowerThanKnees = hipLeft.y > kneeLeft.y && hipRight.y > kneeRight.y;

        const kneesInFrontOfAnkles = kneeLeft.y < ankleLeft.y && kneeRight.y < ankleRight.y;

        if (hipsLowerThanKnees && kneesInFrontOfAnkles) {
            setSquatStatus('Correct position');
        } else {
            setSquatStatus('Incorrect position');
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
            setStatus('Correct Push-Up');
        } else {
            setStatus('Incorrect Push-Up');
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
        const canvasCtx = canvasElement.getContext('2d');

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        drawLandmarks(canvasCtx, results.poseLandmarks, {
            color: '#FF0000',
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
            canvasCtx.moveTo(startLandmark.x * canvasElement.width, startLandmark.y * canvasElement.height);
            canvasCtx.lineTo(endLandmark.x * canvasElement.width, endLandmark.y * canvasElement.height);
            canvasCtx.strokeStyle = '#FFFFFF';
            canvasCtx.lineWidth = 2;
            canvasCtx.stroke();
        });

        if (exerciseType === 'Squat') {
            checkSquatPosition(results.poseLandmarks);
        } else if (exerciseType === 'PushUp') {
            checkPushUpPosition(results.poseLandmarks);
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

        pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

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

    return (
        <div
            style={{
                position: 'relative',
                width: '100vw', // Full screen width
                height: '90vh', // Full screen height
                margin: 'auto',
                textAlign: 'center',
                backgroundColor: '#121212', // Consistent background
            }}
        >
            {/* Top Bar */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'fixed', // Sticks to the top
                    top: 0,
                    width: '100%', // Full screen width
                    backgroundColor: '#121212',
                    padding: isMobile ? '10px' : '20px',
                    boxSizing: 'border-box',
                    zIndex: 10,
                    color: 'white',
                }}
            >
                {/* Back Button */}
                <Button
                    onClick={() => navigate('/')}
                    variant="text"
                    sx={{
                        color: '#5955F4',
                        fontSize: '16px',
                        cursor: 'pointer',
                    }}
                >
                    {'< Back'}
                </Button>

                {/* Exercise Title */}
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                        marginLeft: '-80px',
                        flex: 1, // Take the remaining space
                        textAlign: 'center',
                        color: 'white',
                        fontSize: isMobile ? '26px' : '32px', // Larger font size for mobile
                        fontWeight: 'bold', // Make title more prominent
                    }}
                >
                    {exerciseType} Analysis
                </Typography>
            </div>

            {/* Main Content */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: isMobile ? '50px' : '80px', // Adjust for the top bar height
                    position: 'relative',
                    height: 'calc(100% - 80px)', // Adjust for the top bar height
                    overflow: 'hidden',
                }}
            >
                {/* Webcam and Canvas Container */}
                <div
                    style={{
                        position: 'relative',
                        width: isMobile ? '90%' : '640px', // Maintain aspect ratio on different devices
                        height: isMobile ? '60%' : '480px', // Maintain aspect ratio
                        marginTop: '-150px', // Move up slightly on mobile
                    }}
                >
                    {/* Webcam */}
                    <Webcam
                        ref={webcamRef}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%', // Match container width
                            height: '100%', // Match container height
                            zIndex: 1,
                            objectFit: 'cover', // Adjust to fill the container
                        }}
                    />

                    {/* Canvas */}
                    <canvas
                        ref={canvasRef}
                        className="output_canvas"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%', // Match container width
                            height: '100%', // Match container height
                            zIndex: 2, // Above the webcam
                        }}
                    ></canvas>
                </div>
            </div>

            {/* Status Label */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '60px', // Spacing from the bottom
                    width: '100%',
                    textAlign: 'center',
                    color: 'white',
                    fontSize: isMobile ? '16px' : '24px', // Adjust font size for screen size
                    zIndex: 3,
                }}
            >
                <p>{squatStatus || status}</p>
            </div>
        </div>
    );
}

export default PoseTrackingApp;
