import * as tf from '@tensorflow/tfjs';

// Funzione per calcolare l'angolo tra tre punti
const calcolaAngolo = (head, ankle, wrist) => {
    const v1 = {
        x: ankle.x - head.x,
        y: ankle.y - head.y,
    };

    const v2 = {
        x: wrist.x - ankle.x,
        y: wrist.y - ankle.y,
    };

    const dotProduct = v1.x * v2.x + v1.y * v2.y;
    const magnitudeV1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
    const magnitudeV2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);

    const cosTheta = dotProduct / (magnitudeV1 * magnitudeV2);
    const theta = Math.acos(cosTheta) * (180 / Math.PI);

    return theta;
};

// Funzione per appiattire i landmarks
const flattenLandmarks = (landmarks) => {
    return landmarks.flatMap(({ x, y, z, visibility }) => [x, y, z, visibility]);
};

// Funzione per caricare il modello
let model = null;
const loadModel = async () => {
    if (!model) {
        model = await tf.loadLayersModel('/modelpushup/model.json');
        console.log('Modello caricato con successo!');
    }
    return model;
};

// Funzione per verificare la correttezza del push-up
const predictPushup = async (landmarks) => {

    if (model == null){
      await loadModel();
    }
    
    const flattened = flattenLandmarks(landmarks);
    const inputTensor = tf.tensor2d([flattened], [1, 132]);
    const prediction = model.predict(inputTensor);
    const predictionValue = prediction.dataSync()[0];
    console.log("predictionValue:", predictionValue);
    return (predictionValue > 0.995);
};

// Funzione per contare i push-up
export const countPushups = async (landmarks, previousState) => {
    const { pushupCount, pushupFlag } = previousState;

    if (!landmarks || landmarks.length === 0) {
        return previousState; // Se non ci sono landmarks, non fare nulla
    }

    // Estrai i punti chiave necessari
    const head = landmarks[0];
    const ankle = landmarks[28];
    const wristR = landmarks[15];
    const wristL = landmarks[16];
    const shoulder = landmarks[12];

    const frameHeight = 480;

    // Calcola l'angolo tra Head-Ankle e Ankle-Wrist
    const angle = calcolaAngolo(head, ankle, wristL);

    // Calcola la distanza tra la testa e i polsi
    const mediW = (wristR.y + wristL.y) / 2;
    const distance = Math.abs(head.y - mediW) * frameHeight;

    // Verifica la correttezza del push-up utilizzando il modello
    const correctness = await predictPushup(landmarks);

    let newPushupFlag = pushupFlag;

    // Logica per determinare il completamento del push-up
    if (distance < 160 && angle >= 0 && angle <= 90 ) {
        newPushupFlag = true; // Pushup in corso
        console.log('Push-up in corso!');
    }

    console.log("correctness:", correctness);
    if (newPushupFlag && distance > 175 && correctness) {
        console.log('Push-up completato!');
        return { pushupCount: pushupCount - 1, pushupFlag: false }; // Incrementa il contatore e resetta il flag
    }

    return { pushupCount, pushupFlag: newPushupFlag }; // Ritorna lo stato aggiornato
};
