const express = require('express');
const multer = require('multer');
const { Canvas, Image, ImageData } = require('canvas');
const faceApi = require('face-api.js');
const path = require('path');
const fs = require('fs');
const canvas = require('canvas');
const cors = require("cors");


// Initialize Express and Multer
const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());
// Load models
faceApi.env.monkeyPatch({ Canvas, Image, ImageData });
(async () => {
    await faceApi.nets.ssdMobilenetv1.loadFromDisk('./models');
    await faceApi.nets.faceRecognitionNet.loadFromDisk('./models');
    await faceApi.nets.faceLandmark68Net.loadFromDisk('./models');
})();



// API to handle image upload and store it
app.post('/upload', upload.single('image'), (req, res) => {
    const imgPath = path.join(__dirname, 'uploads', req.file.filename);
    res.send({ path: imgPath });
});

// API to compare faces
app.post('/compare', upload.single('image'), async (req, res) => {
    const imgPath = path.join(__dirname, 'uploads', req.file.filename);
    const storedImage = fs.readFileSync('./storedImage.jpg');
    const inputImage = await canvas.loadImage(imgPath);

    const storedImageCanvas = await canvas.loadImage(storedImage);
    const storedImageDetections = await faceApi.detectAllFaces(storedImageCanvas).withFaceLandmarks().withFaceDescriptors();
    const inputImageDetections = await faceApi.detectAllFaces(inputImage).withFaceLandmarks().withFaceDescriptors();

    const faceMatcher = new faceApi.FaceMatcher(storedImageDetections);
    const match = faceMatcher.findBestMatch(inputImageDetections[0].descriptor);

    res.send({ match });
});

app.listen(9000, () => {
    console.log('Server started on http://localhost:3000');
});
