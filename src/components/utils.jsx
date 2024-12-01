
// Funzione per normalizzare una distanza
export function  normalizeDistance (distance, frameHeight) {
    if (frameHeight === 0) {
      throw new Error("frameHeight cannot be zero");
    }
    return distance / frameHeight; // Normalizza la distanza tra 0 e 1
  };
