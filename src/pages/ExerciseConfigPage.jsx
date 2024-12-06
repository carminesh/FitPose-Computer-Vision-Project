import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { useMediaQuery } from 'react-responsive';
import SquatIllustration from '../resources/squat-exercise.svg';
import PushUpIllustration from '../resources/pushup-exercise.svg';

function ExerciseConfigPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { exerciseType } = location.state || {};
    const [reps, setReps] = useState(0);
    const [maxTime, setMaxTime] = useState(0);

    const handleStartWorkout = () => {
        if (reps > 0 && maxTime > 0) {
            navigate('/pose-tracking', { state: { exerciseType, reps, maxTime } });
        }
    };

    const isMobile = useMediaQuery({ query: '(max-width: 767px)' });

    // Dynamic data based on the exercise type
    const exerciseData = {
        squat: {
            illustration: SquatIllustration,
            hints: ['Keep your back straight and chest lifted.', 'Ensure your knees don’t go past your toes.', 'Engage your core and breathe steadily.'],
        },
        pushup: {
            illustration: PushUpIllustration,
            hints: ['Keep your body straight from head to heels.', 'Lower yourself until your elbows are at a 90-degree angle.', 'Push back up while keeping your core engaged.'],
        },
    };

    const selectedExercise = exerciseData[exerciseType.toLowerCase()] || exerciseData.squat;

    return (
        <Container
            sx={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '100vh',
                padding: isMobile ? 2 : 4,
                backgroundColor: '#121212',
                maxWidth: '100%',
            }}
        >
            {/* Top Bar with Back Button */}
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

                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                        paddingTop: isMobile ? '20px' : '0px',
                        paddingRight: '70px',
                        flex: 1,
                        textAlign: 'center',
                        color: 'white',
                        fontSize: isMobile ? '26px' : '32px',
                        fontWeight: 'bold',
                    }}
                >
                    {exerciseType}
                </Typography>
            </div>

            {/* Illustration and Hints */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    marginBottom: 2,
                    marginTop: '90px',
                }}
            >
                <Box
                    component="img"
                    src={selectedExercise.illustration}
                    alt={`${exerciseType} Illustration`}
                    sx={{
                        width: isMobile ? '60%' : '40%',
                        height: 'auto',
                    }}
                />
            </Box>

            {/* Main Content */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexGrow: 1,
                    width: isMobile ? '100%' : '500px',
                }}
            >
                <Typography
                    variant="subtitle2"
                    sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        width: '100%',
                        marginBottom: '40px',
                        padding: 2,
                        paddingY: 3,
                        borderRadius: '18px',
                        color: 'white',
                        fontSize: '18px',
                        textAlign: 'left',
                        border: 0.5,
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                >
                    {selectedExercise.hints.map((hint, index) => (
                        <React.Fragment key={index}>
                            - {hint} <br />
                        </React.Fragment>
                    ))}
                </Typography>

                <TextField
                    label="Enter Repetitions"
                    type="text"
                    value={reps}
                    onChange={(e) => {
                        const value = e.target.value.replace(/^0+/, '');
                        const parsedValue = parseInt(value, 10);
                        setReps(isNaN(parsedValue) ? 0 : parsedValue);
                    }}
                    variant="outlined"
                    sx={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '18px',
                        height: '70px',
                        '& .MuiOutlinedInput-root': {
                            height: '70px',
                            borderRadius: '18px',
                            color: 'white',
                        },
                        '& .MuiInputLabel-root': {
                            color: 'white',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                    }}
                />
                <TextField
                    label="Max Time (seconds)"
                    type="text"
                    value={maxTime}
                    onChange={(e) => {
                        const value = e.target.value.replace(/^0+/, '');
                        const parsedValue = parseInt(value, 10);
                        setMaxTime(isNaN(parsedValue) ? 0 : parsedValue);
                    }}
                    variant="outlined"
                    sx={{
                        width: '100%',
                        height: '70px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '18px',
                        '& .MuiOutlinedInput-root': {
                            height: '70px',
                            borderRadius: '18px',
                            color: 'white',
                        },
                        '& .MuiInputLabel-root': {
                            color: 'white',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                    }}
                />
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleStartWorkout}
                    sx={{
                        backgroundColor: '#5955F4',
                        opacity: reps > 0 && maxTime > 0 ? 1 : 0.4,
                        borderRadius: '20px',
                        width: '100%',
                        height: '70px',
                        padding: isMobile ? '14px' : '16px',
                        fontSize: isMobile ? '20px' : '18px',
                        color: 'white',
                    }}
                >
                    Start Workout
                </Button>
            </Box>
        </Container>
    );
}

export default ExerciseConfigPage;
