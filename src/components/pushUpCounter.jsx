export const countPushups = (landmarks, previousState) => {
    const { pushupCount, pushupFlag } = previousState;
  
    if (!landmarks || landmarks.length === 0) {
      return previousState; // Se non ci sono landmarks, non fare nulla
    }
  
    // Estrai i punti chiave necessari
    const head = landmarks[0]; // Nose (Head)
    const ankle = landmarks[27]; // LEFT_ANKLE
    const wrist = landmarks[28]; // LEFT_WRIST
    
    const frameWidth = 640;  // Imposta la larghezza del frame
    const frameHeight = 480; // Imposta l'altezza del frame
  
    // Calcola l'angolo tra Head-Ankle e Ankle-Wrist
    const angle = Math.atan2(wrist.y - ankle.y, wrist.x - ankle.x) * (180 / Math.PI);  // Angolo tra la linea Ankle-Wrist e la linea Head-Ankle
  
    // Calcola la distanza tra la testa e la caviglia
    const distance = Math.abs(head.y - ankle.y) * frameHeight; // Y-coordinate distanza (multiplicata per l'altezza del frame)
  
    // Logica per determinare se si è in un pushup
    let newPushupFlag = pushupFlag;
  
    // Verifica se la posizione della testa è nella zona giusta e la distanza è inferiore a 250
    if (distance < 250 && angle >= 0 && angle <= 90) {
      newPushupFlag = true;  // Pushup in corso
    }
  
    // Incremento del contatore quando il pushup è completo
    if (newPushupFlag && distance > 300) {
      return { pushupCount: pushupCount + 1, pushupFlag: false };  // Incrementa il contatore e resetta il flag
    }
  
    return { pushupCount, pushupFlag: newPushupFlag }; // Ritorna lo stato aggiornato
  };
  