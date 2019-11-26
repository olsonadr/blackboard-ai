#!/usr/bin/env python
# coding: utf-8

import tensorflow as tf
import tensorflowjs as tfjs
import numpy as np
import sys

mnist = tf.keras.datasets.mnist
num_epochs = (int(sys.argv[1])) if (sys.argv[0]) else (5)

(training_data, training_labels), (test_data, test_labels) = mnist.load_data()

training_data = training_data.reshape(training_data.shape[0], 28, 28, 1)
training_data = training_data.astype("float32")
training_data = training_data / 255

test_data     = test_data.reshape(test_data.shape[0], 28, 28, 1)
test_data     = test_data.astype("float32")
test_data     = test_data / 255

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
model.save("MNIST_trained")
tfjs.converters.save_keras_model(model, "tfjsmodel")
