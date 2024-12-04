import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { useMediaQuery } from 'react-responsive';

function ExerciseConfigPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { exerciseType } = location.state || {};
    const [reps, setReps] = useState(0);

    const handleStartWorkout = () => {
        if (reps > 0) {
            navigate('/pose-tracking', { state: { exerciseType, reps } });
        }
    };

    // Use media queries to detect screen size
    const isMobile = useMediaQuery({ query: '(max-width: 767px)' });

    const handleRepsChange = (e) => {
        // Ensure that the input is a valid number, otherwise set to 0
        const value = e.target.value.replace(/^0+/, ''); // Remove leading zeros
        const parsedValue = parseInt(value, 10);

        if (isNaN(parsedValue)) {
            setReps(0); // Set to 0 if the value is not a number
        } else {
            setReps(parsedValue); // Set to the parsed number if it's valid
        }
    };

    return (
        <Container
            sx={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between', // Space between title and input/button section
                alignItems: 'center',
                height: '100vh', // Full viewport height
                padding: isMobile ? 2 : 4, // More padding for mobile devices
                backgroundColor: '#121212', // Dark background color
                maxWidth: '100%',
            }}
        >
            {/* Title */}
            <Typography
                variant="h4"
                gutterBottom
                sx={{
                    color: 'white',
                    fontSize: isMobile ? '26px' : '32px', // Larger font size for mobile
                    fontWeight: 'bold', // Make title more prominent
                    marginTop: isMobile ? '40px' : '0', // Add space above title on mobile
                }}
            >
                {exerciseType} Configuration
            </Typography>

            {/* Input and Button Section (Center-aligned) */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexGrow: 1, // This ensures the Box will take up available space and keep items centered
                    width: isMobile ? '100%' : '500px', // Make it wider on mobile
                }}
            >
                {/* TextField for Repetitions */}
                <TextField
                    label="Enter Repetitions"
                    type="text" // Use text type for manual control
                    value={reps}
                    onChange={handleRepsChange}
                    variant="outlined"
                    sx={{
                        width: '100%', // Ensure full width on mobile
                        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Dark theme background for input
                        borderRadius: '18px', // Rounded corners
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '18px', // Rounded corners for the input
                            color: 'white', // Input text color
                        },
                        '& .MuiInputLabel-root': {
                            color: 'white', // Label color for dark theme
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.3)', // Lighter border for dark background
                        },
                    }}
                />

                {/* Start Workout Button */}
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleStartWorkout}
                    sx={{
                        backgroundColor: '#5955F4',
                        opacity: reps > 0 ? 1 : 0.4,
                        borderRadius: '20px',
                        width: '100%', // Make button fill the width
                        height: isMobile ? '60px' : '50px', // Increased height for better touch targets on mobile
                        padding: isMobile ? '14px' : '16px', // Adjust padding for mobile
                        fontSize: isMobile ? '20px' : '18px', // Larger font size for mobile
                        color: 'white', // Text color for contrast
                    }}
                >
                    Start Workout
                </Button>
            </Box>
        </Container>
    );
}

export default ExerciseConfigPage;
