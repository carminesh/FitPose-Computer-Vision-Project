import { normalizeDistance } from './utils';
import * as tf from '@tensorflow/tfjs';

// Variabile per mantenere il modello caricato
let model = null;

// Funzione per caricare il modello (una sola volta)
const loadModel = async () => {
    if (!model) {
        model = await tf.loadLayersModel('/model/model.json');
        console.log('Modello TensorFlow.js caricato con successo!');
    }
};

// Funzione per preprocessare i landmarks
const preprocessLandmarks = (landmarks) => {
    if (!Array.isArray(landmarks) || landmarks.length !== 33) {
        throw new Error("L'input deve contenere esattamente 33 landmarks.");
    }

    const features = landmarks.flatMap(({ x, y, z, visibility }) => {
        if ([x, y, z, visibility].some(val => typeof val !== 'number' || isNaN(val))) {
            throw new Error("Uno dei valori dei landmarks non è numerico o è NaN.");
        }
        return [x, y, z, visibility];
    });

    const numTimesteps = 191;
    const paddedInput = Array(numTimesteps).fill(features);

    return tf.tensor3d([paddedInput], [1, numTimesteps, 132]);
};

const predictSquat = async (landmarks) => {
    await loadModel();

    if (!model) {
        console.error("Modello non caricato.");
        return false;
    }

    try {
        const inputTensor = preprocessLandmarks(landmarks);
        const prediction = model.predict(inputTensor);
        const predictionValue = prediction.dataSync()[0];
        console.log("predictionValue:", predictionValue);
        return (predictionValue > 0.2); // True se lo squat è corretto
    } catch (error) {
        console.error("Errore durante la predizione:", error.message);
        return false;
    }
};

export const countSquats = async  (landmarks, previousState) => {
    const { squatCount, squatFlag, recentDistances = [] } = previousState;

    if ( !landmarks || landmarks.length === 0 || !landmarks[0] || !landmarks[27]) {
        return { squatCount, squatFlag, recentDistances };
    }
    const frameHeight = 480;
    const headY = landmarks[0].y;
    const ankleLY = landmarks[27].y;
    const absoluteDistanceL = Math.abs(headY - ankleLY) * frameHeight;
    const normalizedDistanceL = normalizeDistance(absoluteDistanceL, frameHeight);

    const maxFrames = 5;
    const updatedDistances = [...recentDistances, normalizedDistanceL].slice(-maxFrames);
    const smoothedDistanceL = updatedDistances.reduce((sum, val) => sum + val, 0) / updatedDistances.length;

    const squatThresholdLow = 0.45;
    const squatThresholdHigh = 0.50;
    if (smoothedDistanceL < squatThresholdLow && !squatFlag) {
        console.log("incorso", smoothedDistanceL);
   
        return { squatCount, squatFlag: true, recentDistances: updatedDistances }; // Squat in corso
    } else if (squatFlag && smoothedDistanceL > squatThresholdHigh) {
        const isCorrectSquat =  await predictSquat(landmarks);
        console.log("isCorrectSquat:", isCorrectSquat);
        if (isCorrectSquat) {
            return { squatCount: squatCount - 1, squatFlag: false, recentDistances: updatedDistances }; // Squat completato correttamente
        } else {
            return { squatCount, squatFlag: false, recentDistances: updatedDistances }; // Squat non corretto, nessun decremento
        }
    }

    return { squatCount, squatFlag, recentDistances: updatedDistances }; // Nessun cambiamento
};
