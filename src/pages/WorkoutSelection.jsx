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
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between', // Space between title and buttons
                alignItems: 'center',
                height: '100vh', // Full viewport height
                padding: isMobile ? 2 : 4, // More padding for mobile devices
                maxWidth: '100%', // Ensure full width on mobile devices
            }}
        >
            {/* Title */}
            <Typography
                variant={'h4'} // Adjust heading size based on screen size
                gutterBottom
                sx={{
                    color: 'white',
                    fontSize: isMobile ? '26px' : '32px', // Larger font size for mobile
                    fontWeight: 'bold', // Make title more prominent
                    marginTop: isMobile ? '40px' : '0', // Add space above title on mobile
                }}
            >
                Select a Workout
            </Typography>

            <Typography
                variant={'body2'} // Adjust heading size based on screen size
                gutterBottom
                sx={{
                    color: 'white',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    fontSize: isMobile ? '20px' : '24px', // Larger font size for mobile
                    marginTop: isMobile ? '20px' : '0', // Add space above title on mobile
                }}
            >
                Select the type of exercise you would like to analyse
            </Typography>

            {/* Buttons Section */}
            <Box
                display="flex"
                flexDirection="column"
                gap={3}
                sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexGrow: 1, // Ensures the buttons are centered vertically
                    minWidth: isMobile ? '400px' : '500px',
                }}
            >
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleWorkoutSelection('Squat')}
                    sx={{
                        backgroundColor: '#5955F4',
                        borderRadius: '20px',
                        width: '100%', // Wider buttons for mobile
                        height: '70px', // Increased height for better touch targets on mobile
                        padding: isMobile ? '14px' : '16px', // Adjust padding for mobile
                        fontSize: isMobile ? '20px' : '18px', // Larger font size for mobile
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
                        width: '100%', // Wider buttons for mobile
                        height: '70px', // Increased height for better touch targets on mobile
                        padding: isMobile ? '14px' : '16px', // Adjust padding for mobile
                        fontSize: isMobile ? '20px' : '18px', // Larger font size for mobile
                    }}
                >
                    Push Up
                </Button>
            </Box>
        </Container>
    );
}

export default WorkoutSelection;
