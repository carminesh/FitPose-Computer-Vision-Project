import numpy as np
import matplotlib.pyplot as plt
import os
import tensorflow as tf
from keras.utils import to_categorical
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Conv1D, MaxPooling1D, Flatten
from tensorflow.keras.callbacks import TensorBoard
import tensorflowjs as tfjs


def plot_confusion_matrix(cm, class_names):
    fig, ax = plt.subplots(figsize=(6, 6))
    im = ax.imshow(cm, interpolation='nearest', cmap='Blues')
    ax.figure.colorbar(im, ax=ax)

    # Mostra le etichette
    ax.set(xticks=np.arange(cm.shape[1]),
           yticks=np.arange(cm.shape[0]),
           xticklabels=class_names, yticklabels=class_names,
           ylabel='True label',
           xlabel='Predicted label')

    # Mostra i valori nella matrice
    fmt = 'd'
    thresh = cm.max() / 2.
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(j, i, format(cm[i, j], fmt),
                    ha="center", va="center",
                    color="white" if cm[i, j] > thresh else "black")
    plt.title("Confusion Matrix")
    plt.show()

def augment_landmarks(landmarks, noise_level=0.01):
    """
    Aumenta i dati introducendo rumore casuale e traslazioni nei landmarks.
    """
    noise = np.random.normal(0, noise_level, landmarks.shape)  # Rumore casuale
    augmented_landmarks = landmarks + noise
    # Clip i valori per mantenerli validi
    augmented_landmarks = np.clip(augmented_landmarks, 0, 1)
    return augmented_landmarks

def load_data(base_dir):
    features = []
    labels = []

    for label, class_dir in enumerate(['valid', 'invalid']):
        class_path = os.path.join(base_dir, class_dir)
        print(class_path)
        print(label)
        for subfolder in os.listdir(class_path):
            for file in os.listdir(class_path):
                if file.endswith('.npy'):
                    file_path = os.path.join(class_path, file)
                    data = np.load(file_path)
                    features.append(data)
                    labels.append(label)  # 0 per 'valid', 1 per 'invalid'
    my_features = np.array(features)
    my_labels = np.array(labels)
    return my_features, my_labels

# Carica i dati
base_dir = 'C:\\Users\\UTENTE\\PycharmProjects\\pythonProject\\PushUp'
X, y = load_data(base_dir)

# Data augmentation per la classe meno rappresentata
invalid_features = [augment_landmarks(data) for data, label in zip(X, y) if label == 1]
invalid_labels = [1] * len(invalid_features)

# Combina i dati aumentati con quelli originali
X_augmented = np.concatenate((X, np.array(invalid_features)))
y_augmented = np.concatenate((y, np.array(invalid_labels)))

print(f"X_augmented shape: {X_augmented.shape}")
print(f"y_augmented shape: {y_augmented.shape}")

# Divido il dataset in training e test
X_train, X_test, y_train, y_test = train_test_split(X_augmented, y_augmented, test_size=0.2, random_state=42)

# Definisco il modello
model = tf.keras.Sequential([
    Conv1D(64, kernel_size=3, activation='relu', input_shape=(X_train.shape[1], X_train.shape[2])),
    MaxPooling1D(pool_size=2),
    Flatten(),
    Dense(64, activation='relu'),
    Dense(1, activation='sigmoid')  # Output binario
])

# Compila il modello
model.compile(optimizer='adam',
              loss='binary_crossentropy',
              metrics=['accuracy'])

model.summary()

# Addestramento del modello
history = model.fit(
    X_train, y_train,
    epochs=50,
    batch_size=32,
    validation_split=0.2,  # Utilizzo una parte dei dati di training per la validazione
    verbose=1
)

# Valutazione sui dati di test
test_loss, test_accuracy = model.evaluate(X_test, y_test, verbose=1)
print(f"Test Loss: {test_loss}")
print(f"Test Accuracy: {test_accuracy}")

y_pred = (model.predict(X_test) > 0.5).astype(int)  # Converto le probabilità in 0 o 1
y_true = y_test  # Etichette vere

# Calcolo la confusion matrix
cm = confusion_matrix(y_true, y_pred)

# Stampa la confusion matrix
print("Confusion Matrix:\n", cm)

# Visualizza la confusion matrix
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["Invalid", "Valid"])
disp.plot(cmap="Blues")  # colore

# Chiamata alla funzione
plot_confusion_matrix(cm, ["Invalid", "Valid"])

tfjs.converters.save_keras_model(model, '.')
