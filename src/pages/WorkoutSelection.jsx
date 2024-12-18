import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import { useMediaQuery } from 'react-responsive';

function WorkoutSelection() {
    const navigate = useNavigate();

    const handleWorkoutSelection = (exerciseType) => {
        navigate('/exercise-config', { state: { exerciseType } });
    };

    // Use media queries to detect screen size
    const isMobile = useMediaQuery({ query: '(max-width: 767px)' });

    return (
        <Container
            sx={{
                backgroundColor: '#121212',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                height: '100vh', // Full viewport height
                padding: isMobile ? 2 : 4,
                maxWidth: '100%',
            }}
        >
            {/* Title */}
            <Box
                sx={{
                    width: '100%',
                    textAlign: 'center',
                    marginTop: isMobile ? '40px' : '20px',
                }}
            >
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                        color: 'white',
                        fontSize: isMobile ? '26px' : '32px',
                        fontWeight: 'bold',
                    }}
                >
                    Select a Workout
                </Typography>
                <Typography
                    variant="body2"
                    gutterBottom
                    sx={{
                        color: 'white',
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        fontSize: isMobile ? '20px' : '24px',
                        marginTop: isMobile ? '10px' : '0',
                    }}
                >
                    Select the type of exercise you would like to analyse
                </Typography>
            </Box>

            {/* Spacer to push buttons to the bottom */}
            <Box sx={{ flexGrow: 1 }}></Box>

            {/* Buttons Section */}
            <Box
                display="flex"
                flexDirection="column"
                gap={3}
                sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: isMobile ? '100%' : '500px',
                    marginBottom: isMobile ? '40px' : '60px', // Add spacing from the bottom
                }}
            >
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleWorkoutSelection('Squat')}
                    sx={{
                        backgroundColor: '#5955F4',
                        borderRadius: '20px',
                        width: '100%',
                        height: '70px',
                        fontSize: isMobile ? '20px' : '18px',
                    }}
                >
                    Squat
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleWorkoutSelection('PushUp')}
                    sx={{
                        backgroundColor: '#5955F4',
                        borderRadius: '20px',
                        width: '100%',
                        height: '70px',
                        fontSize: isMobile ? '20px' : '18px',
                    }}
                >
                    Push Up
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleWorkoutSelection('Curl')}
                    sx={{
                        backgroundColor: '#5955F4',
                        borderRadius: '20px',
                        width: '100%',
                        height: '70px',
                        fontSize: isMobile ? '20px' : '18px',
                    }}
                >
                    Biceps Curl
                </Button>
            </Box>
        </Container>
    );
}

export default WorkoutSelection;
