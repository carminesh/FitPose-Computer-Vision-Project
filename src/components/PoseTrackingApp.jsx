import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { Pose } from '@mediapipe/pose';
import * as cam from '@mediapipe/camera_utils';
import Rive from '@rive-app/react-canvas';
import { drawLandmarks } from '@mediapipe/drawing_utils';
import { Box, Button, Typography } from '@mui/material';
import { countSquats } from './squatCounter';
import { countPushups } from './pushUpCounter';

function PoseTrackingApp() {
    const [exercType, setExercType] = useState('');
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { exerciseType, reps, maxTime } = location.state || {};
    const [status, setStatus] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(maxTime);
    const [hasFinished, setHasFinished] = useState(false);

    const cameraRef = useRef(null);
    const isMobile = window.innerWidth <= 768;

    const [squatData, setSquatData] = useState({
        squatCount: reps,
        squatFlag: false,
    });
    const [pushupData, setPushupData] = useState({
        pushupCount: reps,
        pushupFlag: false,
    });

    const stopWebcam = () => {
        if (cameraRef.current) {
            cameraRef.current.stop();
            cameraRef.current = null;
        }
    };

    const resetState = () => {
        stopWebcam();
        navigate('/');
    };

    const onResults = (results) => {
        try {
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

            setExercType(exerciseType);
            if (exerciseType === 'Squat') {
                if (squatData.squatCount > 0) {
                    setSquatData((prevState) => countSquats(results.poseLandmarks, prevState));
                }
            } else if (exerciseType === 'PushUp') {
                if (pushupData.pushupCount > 0) {
                    setPushupData((prevState) => countPushups(results.poseLandmarks, prevState));
                }
            }

            canvasCtx.restore();
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        let pose;
        let cameraInitialized = false;

        const initializeCamera = () => {
            if (webcamRef.current && webcamRef.current.video.readyState === 4) {
                if (!cameraInitialized) {
                    try {
                        cameraRef.current = new cam.Camera(webcamRef.current.video, {
                            onFrame: async () => {
                                // Ensure the video object is available before sending
                                if (webcamRef.current && webcamRef.current.video) {
                                    try {
                                        await pose.send({ image: webcamRef.current.video });
                                    } catch (error) {
                                        console.error('Error during pose.send:', error);
                                    }
                                } else {
                                    console.error('Webcam video not available');
                                }
                            },
                            width: 640,
                            height: 480,
                        });

                        cameraRef.current.start();
                        cameraInitialized = true;
                    } catch (error) {
                        console.error('Error initializing camera:', error);
                    }
                }
            } else {
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

        return () => stopWebcam();
    }, [exerciseType]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining((prev) => Math.max(prev - 1, 0));
        }, 1000);

        if (timeRemaining === 0 || squatData.squatCount === 0 || pushupData.pushupCount === 0) {
            console.log('I AM SETTING STOP  ');
            setHasFinished(true);
            stopWebcam();
        }

        return () => clearInterval(timer);
    }, [timeRemaining, squatData.squatCount, pushupData.pushupCount]);

    return (
        <div
            style={{
                position: 'relative',
                width: '100vw',
                height: '90vh',
                margin: 'auto',
                textAlign: 'center',
                backgroundColor: '#121212',
            }}
        >
            {/* Top Bar */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'fixed',
                    top: 0,
                    width: '100%',
                    backgroundColor: '#121212',
                    padding: isMobile ? '10px' : '20px',
                    boxSizing: 'border-box',
                    zIndex: 10,
                    color: 'white',
                }}
            >
                <Button
                    onClick={() => resetState()}
                    variant="text"
                    sx={{
                        color: '#5955F4',
                        fontSize: '16px',
                        cursor: 'pointer',
                    }}
                >
                    {'< Back'}
                </Button>

                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                        marginLeft: '-80px',
                        flex: 1,
                        textAlign: 'center',
                        color: 'white',
                        fontSize: isMobile ? '26px' : '32px',
                        fontWeight: 'bold',
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
                    marginTop: isMobile ? '50px' : '80px',
                    position: 'relative',
                    height: 'calc(100% - 80px)',
                    overflow: 'hidden',
                }}
            >
                {/* Conditional Rendering for Webcam/Canvas or Rive Animation */}
                {!hasFinished ? (
                    <div
                        style={{
                            position: 'relative',
                            width: isMobile ? '90%' : '640px',
                            height: isMobile ? '60%' : '480px',
                            marginTop: '-150px',
                        }}
                    >
                        {/* Webcam */}
                        <Webcam
                            ref={webcamRef}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                zIndex: 1,
                                objectFit: 'cover',
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
                                width: '100%',
                                height: '100%',
                                zIndex: 2,
                            }}
                        ></canvas>
                    </div>
                ) : (
                    <div>
                        <Typography sx={{ color: 'white', marginBottom: '20px' }} variant="h4">
                            Workout Complete!
                        </Typography>
                        <Rive
                            src={squatData.squatCount === 0 || pushupData.pushupCount === 0 ? 'exercise_completed.riv' : 'exercise_not_completed.riv'}
                            stateMachines={squatData.squatCount === 0 || pushupData.pushupCount === 0 ? 'done' : 'notDone'}
                            style={{
                                zIndex: 10,
                                width: isMobile ? '160px' : '320px',
                                height: isMobile ? '160px' : '320px',
                            }}
                            onLoad={() => console.log('Rive Loaded')}
                            onError={(error) => console.error('Rive Load Error:', error)}
                        />
                    </div>
                )}
            </div>

            {/* Status Label */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '60px',
                    width: '100%',
                    textAlign: 'center',
                    color: 'white',
                    fontSize: isMobile ? '16px' : '24px',
                    zIndex: 3,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Box
                    sx={{
                        flexDirection: 'row',
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                    }}
                >
                    <Box
                        sx={{
                            flexDirection: 'column',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: isMobile ? 5 : 6,
                        }}
                    >
                        <Typography sx={{ marginBottom: '12px', color: 'white' }} variant="h5">
                            Left reps:
                        </Typography>
                        <Box
                            sx={{
                                backgroundColor: '#383837',
                                width: '100px',
                                height: '100px',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Typography sx={{ color: 'white' }} variant="h4">
                                {exercType === 'Squat' ? squatData.squatCount : pushupData.pushupCount}
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            flexDirection: 'column',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: isMobile ? 5 : 6,
                        }}
                    >
                        <Typography sx={{ marginBottom: '12px', color: 'white' }} variant="h5">
                            Time Left:
                        </Typography>

                        <Box
                            sx={{
                                backgroundColor: '#383837',
                                width: '100px',
                                height: '100px',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Typography sx={{ color: 'white' }} variant="h4">
                                {timeRemaining}s
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </div>
        </div>
    );
}

export default PoseTrackingApp;
