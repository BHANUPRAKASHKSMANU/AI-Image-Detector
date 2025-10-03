// AI Image Detector Application

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - Image Analysis
    const imageTab = document.getElementById('image-tab');
    const videoTab = document.getElementById('video-tab');
    const imageUploadContainer = document.getElementById('image-upload-container');
    const videoUploadContainer = document.getElementById('video-upload-container');
    
    const imageDropArea = document.getElementById('image-drop-area');
    const imageFileInput = document.getElementById('image-file-input');
    const imageUploadButton = document.getElementById('image-upload-button');
    const analyzeImageButton = document.getElementById('analyze-image-button');
    const imagePreviewArea = document.getElementById('image-preview-area');
    const previewImage = document.getElementById('preview-image');
    const changeImageButton = document.getElementById('change-image');
    
    // DOM Elements - Video Analysis
    const videoDropArea = document.getElementById('video-drop-area');
    const videoFileInput = document.getElementById('video-file-input');
    const videoUploadButton = document.getElementById('video-upload-button');
    const analyzeVideoButton = document.getElementById('analyze-video-button');
    const videoPreviewArea = document.getElementById('video-preview-area');
    const previewVideo = document.getElementById('preview-video');
    const changeVideoButton = document.getElementById('change-video');
    
    // DOM Elements - Results
    const resultsSection = document.getElementById('results-section');
    const resultImage = document.getElementById('result-image');
    const meterFill = document.getElementById('meter-fill');
    const scoreValue = document.getElementById('score-value');
    const resultVerdict = document.getElementById('result-verdict');
    const resultExplanation = document.getElementById('result-explanation');
    const imageResultBanner = document.getElementById('image-result-banner');

    // Current media files
    let currentImageFile = null;
    let currentVideoFile = null;
    let videoFrameCanvas = document.createElement('canvas');
    let videoFrameCtx = videoFrameCanvas.getContext('2d');
    let videoFrameRate = 1; // Analyze 1 frame per second
    let videoDetectionResults = [];

    // Tab switching
    imageTab.addEventListener('click', () => {
        imageTab.classList.add('active');
        videoTab.classList.remove('active');
        imageUploadContainer.style.display = 'block';
        videoUploadContainer.style.display = 'none';
    });
    
    videoTab.addEventListener('click', () => {
        videoTab.classList.add('active');
        imageTab.classList.remove('active');
        videoUploadContainer.style.display = 'block';
        imageUploadContainer.style.display = 'none';
    });

    // Image Event Listeners
    imageUploadButton.addEventListener('click', () => imageFileInput.click());
    imageFileInput.addEventListener('change', handleImageSelect);
    changeImageButton.addEventListener('click', () => imageFileInput.click());
    analyzeImageButton.addEventListener('click', analyzeImage);
    
    // Video Event Listeners
    videoUploadButton.addEventListener('click', () => videoFileInput.click());
    videoFileInput.addEventListener('change', handleVideoSelect);
    changeVideoButton.addEventListener('click', () => videoFileInput.click());
    analyzeVideoButton.addEventListener('click', analyzeVideo);
    
    // Drag and drop events - Image
    setupDragAndDrop(imageDropArea, handleImageDrop);
    
    // Drag and drop events - Video
    setupDragAndDrop(videoDropArea, handleVideoDrop);
    
    function setupDragAndDrop(dropArea, dropHandler) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => highlight(dropArea), false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => unhighlight(dropArea), false);
        });
        
        dropArea.addEventListener('drop', dropHandler, false);
    }
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight(area) {
        area.classList.add('dragover');
    }
    
    function unhighlight(area) {
        area.classList.remove('dragover');
    }
    
    function handleImageDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            handleImageFiles(files);
        }
    }
    
    function handleVideoDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            handleVideoFiles(files);
        }
    }
    
    function handleImageSelect(e) {
        if (e.target.files.length) {
            handleImageFiles(e.target.files);
        }
    }
    
    function handleVideoSelect(e) {
        if (e.target.files.length) {
            handleVideoFiles(e.target.files);
        }
    }
    
    function handleImageFiles(files) {
        if (files[0].type.startsWith('image/')) {
            currentImageFile = files[0];
            previewImageFile(currentImageFile);
            analyzeImageButton.disabled = false;
        } else {
            alert('Please select an image file (JPG, PNG, WebP)');
        }
    }
    
    function handleVideoFiles(files) {
        if (files[0].type.startsWith('video/')) {
            currentVideoFile = files[0];
            previewVideoFile(currentVideoFile);
            analyzeVideoButton.disabled = false;
        } else {
            alert('Please select a video file (MP4, WebM, etc.)');
        }
    }
    
    function previewImageFile(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            imageDropArea.querySelector('.upload-prompt').hidden = true;
            imagePreviewArea.hidden = false;
        }
        
        reader.readAsDataURL(file);
    }
    
    function previewVideoFile(file) {
        const videoURL = URL.createObjectURL(file);
        previewVideo.src = videoURL;
        videoDropArea.querySelector('.upload-prompt').hidden = true;
        videoPreviewArea.hidden = false;
    }
    
    async function analyzeImage() {
        if (!currentImageFile) return;

        // Show loading state
        document.getElementById('loading-spinner').style.display = 'flex';
        analyzeImageButton.disabled = true;
        
        try {
            // Create an instance of the AI detector
            const detector = new AIImageDetector();
            await detector.initialize();
            
            // Create an image element for the detector
            const img = new Image();
            
            img.onload = async function() {
                try {
                    // Detect if the image is AI-generated
                    const result = await detector.detectImage(img);
                    
                    // Populate the prominent banner above the upload area
                    if (imageResultBanner) {
                        const prob = Math.round(result.aiProbability || 0);
                        let bannerText = '';
                        let bgColor = '#4CAF50';
                        if (prob > 70) {
                            bannerText = `AI-GENERATED — ${prob}% likely`; bgColor = '#ff4d4d';
                        } else if (prob > 30) {
                            bannerText = `Possibly Manipulated — ${prob}% likely`; bgColor = '#ffa64d';
                        } else {
                            bannerText = `Likely Authentic — ${100 - prob}% confident`; bgColor = '#4CAF50';
                        }
                        imageResultBanner.textContent = bannerText;
                        imageResultBanner.style.backgroundColor = bgColor;
                        imageResultBanner.style.color = '#fff';
                        imageResultBanner.style.display = 'block';
                    }

                    // Update UI with results
                    updateImageResults(result);
                } catch (err) {
                    console.error('Error in image analysis:', err);
                    alert('An error occurred while analyzing the image. Please try again.');
                } finally {
                    // Hide loading state
                    document.getElementById('loading-spinner').style.display = 'none';
                    analyzeImageButton.disabled = false;
                }
            };
            
            img.onerror = function() {
                console.error('Error loading image');
                alert('Failed to load the image. Please try another file.');
                document.getElementById('loading-spinner').style.display = 'none';
                analyzeImageButton.disabled = false;
            };
            
            // Set image source from the file
            img.src = URL.createObjectURL(currentImageFile);
            
        } catch (error) {
            console.error('Error analyzing image:', error);
            alert('An error occurred while analyzing the image. Please try again.');
            // Hide loading state
            document.getElementById('loading-spinner').style.display = 'none';
            analyzeImageButton.disabled = false;
        }
    }
    
    async function analyzeVideo() {
        if (!currentVideoFile) return;

        // Show loading state
        document.getElementById('loading-spinner').style.display = 'flex';
        analyzeVideoButton.disabled = true;
        videoDetectionResults = [];
        
        try {
            // Create an instance of the AI detector
            const detector = new AIImageDetector();
            await detector.initialize();
            
            // Set up video for frame extraction
            const video = document.createElement('video');
            video.src = URL.createObjectURL(currentVideoFile);
            
            // Wait for video metadata to load
            await new Promise(resolve => {
                video.onloadedmetadata = resolve;
                video.load();
            });
            
            const duration = video.duration || 0;
            // Ensure at least one frame is processed for very short videos
            const totalFrames = Math.max(1, Math.floor(duration / videoFrameRate));
            
            // Set up canvas for frame extraction (use defaults if video reports 0)
            videoFrameCanvas.width = video.videoWidth || 300;
            videoFrameCanvas.height = video.videoHeight || 300;
            
            // Create timeline markers container
            const videoTimeline = document.getElementById('video-timeline');
            videoTimeline.innerHTML = '';
            
            // Process video frames
            for (let i = 0; i < totalFrames; i++) {
                const timePoint = i * videoFrameRate;
                
                // Set video to specific time point
                video.currentTime = timePoint;
                
                // Wait for the frame to be ready
                await new Promise(resolve => {
                    video.onseeked = resolve;
                });
                
                // Draw the frame to canvas
                videoFrameCtx.drawImage(video, 0, 0, videoFrameCanvas.width, videoFrameCanvas.height);

                // Analyze the current canvas frame directly. The AIImageDetector
                // implementation exposes detectImage which accepts an HTMLImageElement,
                // HTMLCanvasElement or video frame for feature extraction via MobileNet.
                // Passing the canvas avoids creating blobs or extra Image objects.
                let result;
                try {
                    result = await detector.detectImage(videoFrameCanvas);
                } catch (frameErr) {
                    console.error('Error analyzing video frame at', timePoint, frameErr);
                    // Fallback result for this frame so the timeline remains consistent
                    result = { aiProbability: 0, explanation: 'Frame analysis failed' };
                }

                // Store the result with timestamp
                videoDetectionResults.push({
                    timePoint,
                    aiProbability: result.aiProbability || 0,
                    explanation: result.explanation || ''
                });
                
                // Create a timeline marker
                const marker = document.createElement('div');
                marker.className = 'timeline-marker';
                marker.style.left = `${(timePoint / duration) * 100}%`;
                
                // Color the marker based on AI probability
                if (result.aiProbability > 70) {
                    marker.style.backgroundColor = '#ff4d4d'; // Red for high probability
                } else if (result.aiProbability > 30) {
                    marker.style.backgroundColor = '#ffa64d'; // Orange for medium probability
                } else {
                    marker.style.backgroundColor = '#4CAF50'; // Green for low probability
                }
                
                // Add click event to show frame result
                marker.addEventListener('click', () => {
                    showVideoFrameResult(timePoint);
                });
                
                videoTimeline.appendChild(marker);
            }
            
            // Update UI with results
            updateVideoResults();
            
            // Clean up
            URL.revokeObjectURL(video.src);
            
        } catch (error) {
            console.error('Error analyzing video:', error);
            alert('An error occurred while analyzing the video. Please try again.');
        } finally {
            // Hide loading state
            document.getElementById('loading-spinner').style.display = 'none';
            analyzeVideoButton.disabled = false;
        }
    }
    
    function showVideoFrameResult(timePoint) {
        // Find the result for this time point
        const result = videoDetectionResults.find(r => r.timePoint === timePoint);
        if (!result) return;
        
        // Set the video to this time point
        previewVideo.currentTime = timePoint;
        
        // Update the result display
        const videoResultVerdict = document.getElementById('video-result-verdict');
        const videoResultExplanation = document.getElementById('video-result-explanation');
        const videoTimeDisplay = document.getElementById('video-time-display');
        
        // Format time as MM:SS
        const minutes = Math.floor(timePoint / 60);
        const seconds = Math.floor(timePoint % 60);
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        videoTimeDisplay.textContent = formattedTime;
        
        // Update verdict and explanation with probability included
        const prob = Math.round((result.aiProbability || 0));
        if (prob > 70) {
            videoResultVerdict.textContent = 'AI-Generated';
            videoResultExplanation.textContent = result.explanation || `This frame shows strong indicators of being generated by AI (probability: ${prob}%).`;
        } else if (prob > 30) {
            videoResultVerdict.textContent = 'Possibly Manipulated';
            videoResultExplanation.textContent = result.explanation || `This frame shows some indicators of manipulation or AI generation (probability: ${prob}%).`;
        } else {
            videoResultVerdict.textContent = 'Likely Authentic';
            videoResultExplanation.textContent = result.explanation || `This frame appears to be authentic (probability: ${prob}%).`;
        }
        
        // Show the video results section
        document.getElementById('video-results-details').style.display = 'block';
    }
    
    function updateImageResults(result) {
        // Force display the results section first
        resultsSection.style.display = 'block';
        resultsSection.hidden = false;
        
        // Update the result image
        resultImage.src = previewImage.src;
        
        // Get the AI probability
        const aiProbability = result.aiProbability;
        
        // Set the verdict based on the probability - simplified to just AI-generated or authentic
        if (aiProbability > 50) {
            resultVerdict.style.backgroundColor = '#ff4d4d'; // Red background
            resultVerdict.style.color = 'white';
            resultVerdict.textContent = 'AI-GENERATED';
        } else {
            resultVerdict.style.backgroundColor = '#4CAF50'; // Green background
            resultVerdict.style.color = 'white';
            resultVerdict.textContent = 'AUTHENTIC';
        }
        
        // Make sure all child elements are visible
        const resultContainer = document.querySelector('.result-container');
        if (resultContainer) resultContainer.style.display = 'flex';
        
        // Force display all result elements
        document.querySelectorAll('.results *').forEach(el => {
            el.style.display = '';
            if (el.hidden) el.hidden = false;
        });
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        console.log('Results displayed:', result);
    }
    
    function updateVideoResults() {
        // Calculate overall AI probability for the video
        const totalFrames = videoDetectionResults.length;
        if (totalFrames === 0) return;
        
        const aiFrames = videoDetectionResults.filter(r => r.aiProbability > 70).length;
        const suspiciousFrames = videoDetectionResults.filter(r => r.aiProbability > 30 && r.aiProbability <= 70).length;
        
        const aiPercentage = Math.round((aiFrames / totalFrames) * 100);
        const suspiciousPercentage = Math.round((suspiciousFrames / totalFrames) * 100);
        
        // Calculate an overall verdict for the video
        let overallVerdict = 'Likely Authentic';
        const overallAIratio = (aiFrames / totalFrames) * 100;
        if (overallAIratio > 50) {
            overallVerdict = 'AI-Generated';
        } else if (overallAIratio > 15) {
            overallVerdict = 'Possibly Manipulated';
        }

        // Update video results summary
        const videoResultsSummary = document.getElementById('video-results-summary');
        videoResultsSummary.innerHTML = `
            <h3>Video Analysis Results</h3>
            <p><strong>Overall verdict:</strong> ${overallVerdict} (${Math.round(overallAIratio)}% of frames highly suspicious)</p>
            <p>Total frames analyzed: ${totalFrames}</p>
            <p>AI-generated frames: ${aiFrames} (${aiPercentage}%)</p>
            <p>Suspicious frames: ${suspiciousFrames} (${suspiciousPercentage}%)</p>
            <p>Click on any marker in the timeline to see detailed results for that frame.</p>
        `;
        
        // Show the video results section
        document.getElementById('video-results-section').hidden = false;
        
        // If there are AI-generated frames, show the first one
        if (aiFrames > 0) {
            const firstAIFrame = videoDetectionResults.find(r => r.aiProbability > 70);
            if (firstAIFrame) {
                showVideoFrameResult(firstAIFrame.timePoint);
            }
        } else if (suspiciousFrames > 0) {
            const firstSuspiciousFrame = videoDetectionResults.find(r => r.aiProbability > 30 && r.aiProbability <= 70);
            if (firstSuspiciousFrame) {
                showVideoFrameResult(firstSuspiciousFrame.timePoint);
            }
        } else if (totalFrames > 0) {
            showVideoFrameResult(videoDetectionResults[0].timePoint);
        }
        
        // Scroll to results
        document.getElementById('video-results-section').scrollIntoView({ behavior: 'smooth' });
    }

    // For production: Implement actual AI detection API
    async function detectAIImage(imageFile) {
        // This would be replaced with actual API call to a service like:
        // - Hugging Face AI detection models
        // - Custom trained model on TensorFlow.js
        // - Third-party AI detection API
        
        // Example implementation with FormData for API call:
        /*
        const formData = new FormData();
        formData.append('image', imageFile);
        
        try {
            const response = await fetch('https://api.aidetector.example/detect', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('API request failed');
            }
            
            const result = await response.json();
            return result.aiProbability; // 0-100 value
        } catch (error) {
            console.error('Error detecting AI image:', error);
            return null;
        }
        */
        
        // For demo purposes, we'll use the filename-based detection
        const fileName = imageFile.name.toLowerCase();
        if (fileName.includes('ai') || fileName.includes('gen') || fileName.includes('fake')) {
            return Math.random() * (100 - 85) + 85; // 85-100% probability
        } else {
            return Math.random() * 15; // 0-15% probability
        }
    }
});

// TensorFlow.js implementation for local AI detection
// This would be implemented in production for client-side AI detection
// without requiring server calls

/*
// Load TensorFlow.js and the pre-trained model
async function loadModel() {
    // Load model from a URL or locally
    const model = await tf.loadLayersModel('model/model.json');
    return model;
}

// Process image for model input
async function preprocessImage(imageElement) {
    // Convert image to tensor
    const tensor = tf.browser.fromPixels(imageElement)
        .resizeNearestNeighbor([224, 224]) // Resize to model input size
        .toFloat()
        .div(tf.scalar(255.0))
        .expandDims();
    
    return tensor;
}

// Predict if image is AI-generated
async function predictImage(imageElement) {
    const model = await loadModel();
    const tensor = await preprocessImage(imageElement);
    
    // Run prediction
    const predictions = await model.predict(tensor);
    const probabilityData = await predictions.data();
    
    // Clean up tensors
    tensor.dispose();
    predictions.dispose();
    
    // Return AI probability (0-100)
    return probabilityData[0] * 100;
}
*/