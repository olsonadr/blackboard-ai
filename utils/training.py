#!/usr/local/bin/python3

import tensorflow as tf
import tensorflowjs as tfjs
import numpy as np
import sys

args = sys.argv

num_epochs = (int(sys.argv[1])) if (len(args) > 0) else (5)
modelOutDir = (args[2]) if (len(args) > 1) else (".")

mnist = tf.keras.datasets.mnist

(training_data, training_labels), (test_data, test_labels) = mnist.load_data()

training_data = training_data.reshape(training_data.shape[0], 28, 28, 1)
training_data = training_data.astype("float32")
training_data = training_data / 255.0

test_data     = test_data.reshape(test_data.shape[0], 28, 28, 1)
test_data     = test_data.astype("float32")
test_data     = test_data / 255.0

model = tf.keras.Sequential([
    tf.keras.layers.Flatten(input_shape = (28, 28, 1)),
    tf.keras.layers.Dense(128, activation = tf.nn.relu),
    tf.keras.layers.Dense(10,  activation = tf.nn.softmax)
])

model.compile(optimizer = tf.keras.optimizers.Adam(),
              loss = 'sparse_categorical_crossentropy',
              metrics = ['accuracy'])


model.fit(training_data, training_labels, epochs = num_epochs)

# score = model.evaluate(test_data, test_labels)
# print(score)
model.save((modelOutDir + "/MNIST_trained"))
tfjs.converters.save_keras_model(model, (modelOutDir + "/tfjsmodel"))
