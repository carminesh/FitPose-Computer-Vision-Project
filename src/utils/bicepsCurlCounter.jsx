export const calculateAngle = (p1, p2, p3) => {
    const x1 = p1.x - p2.x;
    const y1 = p1.y - p2.y;
    const x2 = p3.x - p2.x;
    const y2 = p3.y - p2.y;

    const dot = x1 * x2 + y1 * y2;
    const magnitude1 = Math.sqrt(x1 * x1 + y1 * y1);
    const magnitude2 = Math.sqrt(x2 * x2 + y2 * y2);

    const cosTheta = dot / (magnitude1 * magnitude2);
    const angle = Math.acos(cosTheta) * (180 / Math.PI); // Convert to degrees

    return angle;
};

export const countBicepsCurls = (landmarks, previousState = { bicepsCurlCount: 0, bicepsCurlFlag: false, recentAngles: [] }) => {
    // Destructure previousState with default values if not provided
    const { bicepsCurlCount, bicepsCurlFlag, recentAngles = [] } = previousState;

    if (!landmarks || landmarks.length === 0) {
        return previousState; // If no landmarks, return previous state
    }

    // Left arm landmarks: Left Shoulder (11), Left Elbow (13), Left Wrist (15)
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];

    // Right arm landmarks: Right Shoulder (12), Right Elbow (14), Right Wrist (16)
    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];

    // Ensure both arms have all required landmarks
    if (!leftShoulder || !leftElbow || !leftWrist || !rightShoulder || !rightElbow || !rightWrist) {
        return previousState;
    }

    // Calculate angles for both arms
    const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

    // Update recent angles (for both arms)
    const maxFrames = 5; // Number of frames to consider
    const updatedAngles = [...recentAngles, { left: leftAngle, right: rightAngle }].slice(-maxFrames);

    // Calculate the moving average of angles for both arms
    const smoothedLeftAngle = updatedAngles.reduce((sum, val) => sum + val.left, 0) / updatedAngles.length;
    const smoothedRightAngle = updatedAngles.reduce((sum, val) => sum + val.right, 0) / updatedAngles.length;

    // Biceps curl angle limits (for both arms)
    const bicepsCurlAngleLow = 140; // Lower angle (almost straight arm)
    const bicepsCurlAngleHigh = 50; // Upper angle (fully bent arm)

    // Check if either arm is in a curl motion (either left or right arm)
    const isCurlInProgress = smoothedLeftAngle > bicepsCurlAngleLow || smoothedRightAngle > bicepsCurlAngleLow;

    // Introduce a buffer zone: Only decrement the count if both arms are consistently below the high angle for multiple frames
    const bufferZoneFrames = 3; // Number of frames both arms need to be below the high angle to trigger a decrement
    const isBothArmsBent = smoothedLeftAngle < bicepsCurlAngleHigh && smoothedRightAngle < bicepsCurlAngleHigh;

    // If curl is in progress and flag is not set, start counting
    if (isCurlInProgress && !bicepsCurlFlag) {
        return {
            bicepsCurlCount, // Keep the count unchanged here
            bicepsCurlFlag: true,
            recentAngles: updatedAngles,
        };
    }

    // If both arms are bent for the buffer zone, decrement the count
    if (bicepsCurlFlag && isBothArmsBent) {
        const recentBentFrames = updatedAngles.filter((angle) => angle.left < bicepsCurlAngleHigh && angle.right < bicepsCurlAngleHigh).length;

        if (recentBentFrames >= bufferZoneFrames) {
            return {
                bicepsCurlCount: bicepsCurlCount - 1,
                bicepsCurlFlag: false, // Reset the flag
                recentAngles: updatedAngles,
            };
        }
    }

    // Return updated state with the unified bicepsCurlCount and flag for both arms
    return {
        bicepsCurlCount, // Keep the count unchanged
        bicepsCurlFlag,
        recentAngles: updatedAngles,
    };
};
