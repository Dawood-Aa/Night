const fs = require('fs');
const path = require('path');

// Define the path to the FemdomImages folder
const folderPath = path.join(__dirname, 'FemdomImages');

// Create an empty array to hold the file names
let Femdom = [];

// Read the filenames in the folder
fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
  } else {
    // Store the files in the Femdom array
    Femdom = files;
    
    // Print the array
    console.log(Femdom);
  }
});