import { normalizeDistance } from './utils';

export const countSquats = (landmarks, previousState) => {
    const { squatCount, squatFlag } = previousState;

    if (!landmarks || landmarks.length === 0) {
        return previousState; // Se non ci sono landmarks, non fare nulla
    }
    const frameHeight = 480; // Imposta l'altezza del frame

    // Estrai i punti richiesti (Head e Left Ankle)
    const headY = landmarks[0].y; // NOSE (Head)
    const ankleLY = landmarks[27].y; // LEFT_ANKLE
    //const ankleRY = landmarks[28].y; // RIGHT_ANKLE

    const absoluteDistanceL = Math.abs(headY - ankleLY) * frameHeight;
    //const absoluteDistanceR = Math.abs(headY - ankleRY);

    // Calcola la distanza normalizzata
    const normalizedDistanceL = normalizeDistance(absoluteDistanceL, frameHeight);
    //const normalizedDistanceR = normalizeDistance(absoluteDistanceR, frameHeight);

    // Logica per il conteggio degli squat
    if (normalizedDistanceL < 0.5 && !squatFlag) {
        // Squat in corso
        return { squatCount, squatFlag: true };
    } else if (squatFlag && normalizedDistanceL > 0.5) {
        // Squat completato
        return { squatCount: squatCount - 1, squatFlag: false };
    }

    return previousState; // Nessuna modifica
};
