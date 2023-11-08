import React, { useState, useEffect } from "react";
import map from "../src/USmap.png"; // Update this path based on your project structure
import "./App.css";

function App() {
  const fixedImageSize = 300; // Fixed size for reference map
  const [currentState, setCurrentState] = useState(1);
  const [experimentCount, setExperimentCount] = useState(0);
  const [imageSize, setImageSize] = useState(fixedImageSize);
  const [displayState, setDisplayState] = useState("whiteScreen");
  const [startTime, setStartTime] = useState(null);
  const [data, setData] = useState([]);

  const maxExperiments = 5; // Maximum number of experiments

  function getRandomSize() {
    return 300 + Math.floor(Math.random() * 101) - 50; // Random size between 250 and 350
  }

  function downloadCSV(data) {
    const csvRows = [
      [
        "Experiment Count",
        "Guess",
        "Time Taken (s)",
        "Image Size",
        "Percent Difference",
      ], // Updated CSV Header
      ...data.map((item) => [
        item.experimentCount,
        item.guess,
        item.timeTaken,
        item.imageSize,
        item.percentDifference,
      ]),
    ];

    const csvString = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "experiment-data-image-size-300px.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  }

  function flashWhiteScreen() {
    setDisplayState("whiteScreen");
    setTimeout(() => setDisplayState("fixedMap"), 300); // Flash white screen for 500ms
  }

  // Separate useEffect for keyPress Event
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (currentState === 1 || currentState === 2) {
        setCurrentState(currentState + 1);
        if (currentState === 2) {
          flashWhiteScreen();
        }
      } else if (currentState === 3 && ["b", "s"].includes(event.key)) {
        let guess = event.key === "b" ? "Bigger" : "Smaller";
        let timeTaken = (Date.now() - startTime) / 1000; // Time in seconds
        let percentDifferenceValue = (
          ((imageSize - fixedImageSize) / fixedImageSize) * 100).toFixed(2);
        let percentDifference =
          imageSize > fixedImageSize
            ? `Bigger (+${percentDifferenceValue}%)`
            : `Smaller (${percentDifferenceValue}%)`;

        // Notice we're using 'imageSize' here instead of 'newImageSize'
        setData((data) => [
          ...data,
          {
            experimentCount: experimentCount + 1,
            guess,
            timeTaken,
            imageSize,
            percentDifference,
          },
        ]);

        setExperimentCount(experimentCount + 1);
        flashWhiteScreen(); // Initiate sequence for next trial
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [currentState, imageSize, startTime, data, experimentCount]);

  useEffect(() => {
    if (displayState === "fixedMap") {
      const newImageSize = getRandomSize();
      setImageSize(newImageSize); // First, set the new random image size
      setTimeout(() => {
        setDisplayState("alteredMap"); // Then, display the altered map
        setStartTime(Date.now()); // Restart the timer for user response
      }, 100); // Flash fixed-size map for 500ms
    }
  }, [displayState]);

  // Effect for ending the experiment and downloading data
  useEffect(() => {
    if (experimentCount >= maxExperiments) {
      setCurrentState(4);
      downloadCSV(data); // Download experiment data
    }
  }, [experimentCount, data]);

  return (
    <div className="App" style={{ textAlign: "center" }}>
      {currentState === 1 && (
        <div>Welcome to the experiment. Press any key to begin.</div>
      )}
      {currentState === 2 && (
        <div>
          In this experiment, a map will appear in the center of the screen
          <p>
            if the map gets <strong>bigger</strong>, press the letter B on the
            keyboard.
          </p>
          <p>
            if the map is <strong>smaller</strong>, press the letter S.
          </p>
          <p>Press any key to begin.</p>
        </div>
      )}
      {currentState === 3 && (
        <div
          style={
            displayState === "whiteScreen"
              ? { backgroundColor: "white", height: "100vh", width: "100vw" }
              : {}
          }
        >
          {displayState === "fixedMap" && (
            <img src={map} alt="US Map" style={{ height: fixedImageSize }} />
          )}
          {displayState === "alteredMap" && (
            <img src={map} alt="US Map" style={{ height: imageSize }} />
          )}
        </div>
      )}
      {currentState === 4 && (
        <div>Thank you for participating in the experiment!</div>
      )}
    </div>
  );
}

export default App;

// <div>
//   In this experiment, a map will appear in the center of the screen
//   <p>if the map gets <strong>bigger</strong>, press the letter B on the keyboard.</p>
//   <p>if the map is <strong>smaller</strong>, press the letter S.</p>
//   <p>Press any key to begin.</p>
// </div>
