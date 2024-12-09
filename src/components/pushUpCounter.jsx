 const calcolaAngolo = (head, ankle, wrist) => {
    // Vettore Head-Ankle
    const v1 = {
      x: ankle.x - head.x,
      y: ankle.y - head.y,
    };

    // Vettore Ankle-Wrist
    const v2 = {
      x: wrist.x - ankle.x,
      y: wrist.y - ankle.y,
    };

    // Calcola il prodotto scalare e i moduli
    const dotProduct = v1.x * v2.x + v1.y * v2.y;
    const magnitudeV1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
    const magnitudeV2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);

    // Calcola l'angolo tra i vettori in gradi
    const cosTheta = dotProduct / (magnitudeV1 * magnitudeV2);
    const theta = Math.acos(cosTheta) * (180 / Math.PI);

    return theta;

};

  // Funzione per verificare le condizioni del push-up
  export const countPushups = (landmarks, previousState) => {
    const { pushupCount, pushupFlag } = previousState;
    console.log(landmarks);
    console.log("pushupCount: !", pushupCount);
    if (!landmarks || landmarks.length === 0) {
        return previousState; // Se non ci sono landmarks, non fare nulla
    }

    // Estrai i punti chiave necessari
    const head = landmarks[0]; // Nose (Head)
    const ankle = landmarks[28]; // LEFT_ANKLE
    const wristR = landmarks[15]; // LEFT_WRIST
    const wristL = landmarks[16]; // LEFT_WRIST
    const shoulder = landmarks[12]; // LEFT_SHOULDER
    

    const frameWidth = 640; // Imposta la larghezza del frame
    const frameHeight = 480; // Imposta l'altezza del frame

    
    // Calcola l'angolo tra Head-Ankle e Ankle-Wrist
    const angle = calcolaAngolo(head,ankle, wristL);
    //console.log("ANGLE: ", angle);
    
    const mediW = (wristR.y + wristL.y) / 2;
    // Calcola la distanza tra la testa e la caviglia
    const distance = Math.abs(head.y - mediW) * frameHeight; // Y-coordinate distanza (multiplicata per l'altezza del frame)
   
    //console.log("distance: ", distance);
    // Logica per determinare se si è in un pushup
    let newPushupFlag = pushupFlag;

    // Verifica se la posizione della testa è nella zona giusta e la distanza è inferiore a 250
    if (distance < 160 && angle >= 0 && angle <= 90) {
        newPushupFlag = true; // Pushup in corso
        console.log("Push-up in corso!");
    }

    // Incremento del contatore quando il pushup è completo
    if (newPushupFlag && distance  > 175) {
        console.log("Push-up completato!");
        return { pushupCount: pushupCount - 1, pushupFlag: false }; // Decrementa il contatore e resetta il flag
    }

    return {pushupCount: pushupCount, pushupFlag: newPushupFlag }; // Ritorna lo stato aggiornato
};

