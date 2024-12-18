import { normalizeDistance } from './utils';

export const countSquats = (landmarks, previousState) => {
    const { squatCount, squatFlag, recentDistances = [] } = previousState;

    if (!previousState) {
        console.error('Lo stato precedente è mancante!');
        return { squatCount: 0, squatFlag: false, recentDistances: [] };
    }

    if (!landmarks || landmarks.length === 0) {
        return previousState; // Se non ci sono landmarks, non fare nulla
    }

    if (!landmarks[0] || !landmarks[27]) {
        return previousState;
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
    // Aggiungi il valore corrente alla lista dei frame recenti
    const maxFrames = 5; // Numero di frame da considerare
    const updatedDistances = [...recentDistances, normalizedDistanceL].slice(-maxFrames);

    // Calcola la media mobile
    const smoothedDistanceL = updatedDistances.reduce((sum, val) => sum + val, 0) / updatedDistances.length;

    // Logica per il conteggio degli squat
    const squatThresholdLow = 0.45; // Soglia inferiore (inizio squat)
    const squatThresholdHigh = 0.55; // Soglia superiore (fine squat)

    if (smoothedDistanceL < squatThresholdLow && !squatFlag) {
        return { squatCount, squatFlag: true, recentDistances: updatedDistances }; // Squat in corso
    } else if (squatFlag && smoothedDistanceL > squatThresholdHigh) {
        return { squatCount: squatCount - 1, squatFlag: false, recentDistances: updatedDistances }; // Squat completato
    }

    return { squatCount, squatFlag, recentDistances: updatedDistances }; // Nessun cambiamento
};
