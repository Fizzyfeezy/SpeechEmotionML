const express = require('express');
const multer = require('multer');
const upload = multer(); // Initialize multer
const app = express();
const wav = require('node-wav'); // Import node-wav
const mfcc = require('mfcc'); // Use 'mfcc' instead of 'node-mfcc'
const fs = require('fs'); // Import the 'fs' module for file operations
const port = 3000; // You can change the port if needed

// Load your saved machine learning model
const tf = require('@tensorflow/tfjs-node');
const modelPath = '/Users/oyelamiabdulhafeez/desktop/big data analytics/projects/assignment/dissertation/cnns_model'; // Update the model path

// Define a function to preprocess audio data by calculating MFCCs
function preprocessAudio(audioData) {
    try {
        // Read the WAV audio data
        const result = wav.decode(audioData);
        const audioArray = result.channelData[0]; // Get audio data as an array

        // Calculate MFCCs using the 'mfcc' library
        const mfccData = mfcc(audioArray, {
            sampleRate: result.sampleRate, // Use the sample rate from the audio file
            frameLength: 0.025, // Length of the analysis frame in seconds
            frameStep: 0.010,  // Step between frames in seconds
            numCoefficients: 13, // Number of MFCC coefficients to calculate
        });

        // Return the preprocessed MFCC data
        return mfccData;
    } catch (error) {
        console.error('Error preprocessing audio:', error);
        throw error;
    }
}

// Load the model asynchronously
async function loadModel() {
    try {
        const loadedModel = await tf.loadLayersModel(`file://${modelPath}/model.json`); // Adjust the model file path
        return loadedModel;
    } catch (error) {
        console.error('Error loading the model:', error);
        throw error;
    }
}

// Serve static files (HTML, CSS, JS) from a 'public' directory
app.use(express.static('public'));

// API endpoint for emotion recognition
app.post('/recognize-emotion', upload.single('audio'), async (req, res) => {
    try {
        // Use req.file to access the uploaded audio file
        const audioData = req.file.buffer; // Assuming the file is sent as a buffer

        // Preprocess the audio data if needed (e.g., convert it to MFCCs)
        const preprocessedAudioData = preprocessAudio(audioData);

        // Load the machine learning model
        const loadedModel = await loadModel();

        // Use the loaded model for making predictions
        const predictions = loadedModel.predict(tf.tensor(preprocessedAudioData)); // Convert MFCC data to a tensor

        // Process predictions and format the response as needed
        const emotionPrediction = processPredictions(predictions);

        // Respond with the prediction
        res.json({ emotion: emotionPrediction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Define your function 'processPredictions' for processing model predictions
function processPredictions(predictions) {
    // Assuming 'predictions' is an array of numerical values representing class probabilities
    // Example: [0.1, 0.7, 0.2, 0.05, 0.02, 0.01] where each value corresponds to an emotion class
    
    // Find the index of the class with the highest probability (argmax)
    const maxProbabilityIndex = predictions.indexOf(Math.max(...predictions));
    
    // Define the emotion labels corresponding to the classes
    const emotionLabels = ["sadness", "happiness", "fear", "neutral", "boredom", "disgust"];
    
    // Get the emotion label associated with the predicted class
    const predictedEmotion = emotionLabels[maxProbabilityIndex];
    
    // Return the predicted emotion
    return predictedEmotion;
}

