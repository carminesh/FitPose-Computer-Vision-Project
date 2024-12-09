
// Funzione per normalizzare una distanza
export function  normalizeDistance (distance, frameHeight) {
    if (frameHeight === 0) {
      throw new Error("frameHeight cannot be zero");
    }
    return distance / frameHeight; // Normalizza la distanza tra 0 e 1
  };


  export function normalizeLandmarks (landmarks, frameHeight)  {
    const leftShoulder = landmarks[11]; // LEFT_SHOULDER
    const rightShoulder = landmarks[12]; // RIGHT_SHOULDER

    // Calcola la distanza tra le spalle come riferimento
    const shoulderDistance = Math.sqrt(
        Math.pow(leftShoulder.x - rightShoulder.x, 2) +
        Math.pow(leftShoulder.y - rightShoulder.y, 2)
    ) * frameHeight;

    // Normalizza i punti chiave rispetto alla distanza tra le spalle
    return landmarks.map((point) => ({
        x: point.x / shoulderDistance,
        y: point.y / shoulderDistance,
    }));
};

let previousLandmarks = null;

export function detectWebcamMovement  ( currentLandmarks)  {
  if (!previousLandmarks) {
      previousLandmarks = currentLandmarks;
      return false;
  }

  const averageMovement = currentLandmarks.reduce((sum, current, index) => {
      const prev = previousLandmarks[index];
      return sum + Math.abs(current.x - prev.x) + Math.abs(current.y - prev.y);
  }, 0) / currentLandmarks.length;

  previousLandmarks = currentLandmarks;

  // Se il movimento medio supera una soglia, è probabile che la webcam si sia mossa
  return averageMovement > 0.1; // La soglia può essere adattata
};