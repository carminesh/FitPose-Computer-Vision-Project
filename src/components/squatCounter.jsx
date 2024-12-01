import { normalizeDistance } from './utils';

export const countSquats = (landmarks, previousState) => {
    const { squatCount, squatFlag } = previousState;
  
    if (!landmarks || landmarks.length === 0) {
      return previousState; // Se non ci sono landmarks, non fare nulla
    }
    const frameHeight = 480; // Imposta l'altezza del frame
  
    // Estrai i punti richiesti (Head e Left Ankle)
    const headY = landmarks[0].y; // NOSE (Head)
    const ankleY = landmarks[27].y; // LEFT_ANKLE
  
    const absoluteDistance = Math.abs(headY - ankleY) * frameHeight;
    const normalizedDistance = normalizeDistance(absoluteDistance, frameHeight);
    // Calcola la distanza normalizzata
    //const normalizedDistance = Math.abs(headY - ankleY) * frameHeight;
  
    // Logica per il conteggio degli squat
    if (normalizedDistance < 0.5) {
      // Squat in corso
      return { squatCount, squatFlag: true };
    } else if (squatFlag && normalizedDistance > 0.5) {
      // Squat completato
      return { squatCount: squatCount + 1, squatFlag: false };
    }
  
    return previousState; // Nessuna modifica
  };
  