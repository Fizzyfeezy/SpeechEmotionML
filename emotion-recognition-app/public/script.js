document.addEventListener('DOMContentLoaded', () => {
  const analyzeButton = document.getElementById('analyzeButton');
  const audioFileInput = document.getElementById('audioFile');
  const predictionResult = document.getElementById('predictionResult');

  analyzeButton.addEventListener('click', async () => {
    const audioFile = audioFileInput.files[0];

    if (!audioFile) {
      predictionResult.textContent = 'Please select an audio file.';
      return;
    }

    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
      const response = await fetch('/recognize-emotion', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      predictionResult.textContent = `Predicted Emotion: ${data.prediction}`;
    } catch (error) {
      console.error(error);
      predictionResult.textContent = 'An error occurred.';
    }
  });
});

