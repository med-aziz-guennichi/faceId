import React, { useRef, useState } from 'react';

const App = () => {
    const [image, setImage] = useState(null);
    const videoRef = useRef(null);

    // Handle image upload
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('http://localhost:9000/upload', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        setImage(data.path);
    };

    // Start camera
    const startCamera = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoRef.current.srcObject = stream;
            });
    };

    // Capture image from webcam and compare
    const handleCaptureAndCompare = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append('image', blob);

            const response = await fetch('http://localhost:9000/compare', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            alert(data.match);
        });
    };

    return (
        <div>
            <h1>Face Recognition App</h1>
            <input type="file" onChange={handleImageUpload} />
            {image && <img src={image} alt="Uploaded" />}
            <button onClick={startCamera}>Start Camera</button>
            <video ref={videoRef} autoPlay></video>
            <button onClick={handleCaptureAndCompare}>Capture and Compare</button>
        </div>
    );
};

export default App;
