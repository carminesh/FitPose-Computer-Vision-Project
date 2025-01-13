#---------------------
import numpy as np
import os
import tensorflow as tf
from keras.utils import to_categorical
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import TensorBoard
import tensorflowjs as tfjs
#----------------------

Squat_result = np.array(['Valid', 'Invalid'])

# 240 videos
# 120 valid e 120 invalid squat
no_of_vids = 120

# Path per i file con numpy arrays
VALID_SAVE_PATH = os.path.join('Squat_Data/Squat_Data')
print (VALID_SAVE_PATH)
label_map = {label:num for num, label in enumerate(Squat_result)}

# inizializzo 2 array: features(sequences) e labels(labels)
sequences, labels = [], []
max_frame_num = 0

for action in Squat_result:
    for sequence in range(no_of_vids):
        counter = True
        window = []
        frame_no = 0
        while counter:
            try:
                res = np.load(os.path.join(VALID_SAVE_PATH, action, str(sequence), "{}.npy".format(frame_no)))
                print(sequence, action, frame_no)
                frame_no+=1
                if frame_no>max_frame_num:
                    max_frame_num=frame_no
                window.append(res)
            except:
                break

        # Controllo: Aggiungi solo sequenze non vuote
        if len(window) > 0:
            sequences.append(window)
            labels.append(label_map[action])

# Pad le sequenze per ottenere (samples, timesteps, features)
max_sequence_length = 191  # Numero massimo di frame
num_features = 132         # Numero di keypoints per frame

X = tf.keras.preprocessing.sequence.pad_sequences(
    sequences, maxlen=max_sequence_length, dtype='float32', padding='post', truncating='post'
)

# reshape dell'array
X = np.array(X).reshape(-1, max_sequence_length, num_features)

# Controllo la nuova forma
print(f"Shape di X 1: {X.shape}")


# 240 features( estratti da video utilizzati per creare il dataset)
# 191(frames) e 132(key-points)
y = to_categorical(labels).astype(int)

# salvo Features e Labels
np.save("Features",X)
np.save("Labels",y)


print(f"Shape di X: {X.shape}")
print(f"Shape di y: {y.shape}")

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# callbacks per tensorboard
log_dir = os.path.join('Logs_Retrain')
tb_callback = TensorBoard(log_dir=log_dir)

# modello LSTM base
model = Sequential()
model.add(LSTM(64, return_sequences=False, activation='relu', input_shape=(191, 132)))
model.add(Dense(64, activation='relu'))
model.add(Dense(32, activation='relu'))
model.add(Dense(Squat_result.shape[0], activation='softmax'))  # Usa softmax per la classificazione

model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
model.summary()

model.fit(X_train, y_train, epochs=100, validation_data=(X_test, y_test), callbacks=[tb_callback])

# Valutazione sui dati di test
test_loss, test_accuracy = model.evaluate(X_test, y_test, verbose=1)
print(f"Test Loss: {test_loss}")
print(f"Test Accuracy: {test_accuracy}")

tfjs.converters.save_keras_model(model, '.')

#model.save('model.h5')
#saved_model = load_model('model.h5')