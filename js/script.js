
const API_KEY = "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";

var exer = false;
var prog = false;
var wait = document.querySelector('#wait').style;
wait.setProperty('--display','none')
//When the first radio button is clicked do the following:
document.getElementById("Exer").addEventListener("click", function () {
  exer = true;
  prog = false;
  document.getElementById('choiceL').innerText = 'Choose your desired muscle:';
  document.getElementById('choice').style.display = 'none';
  document.getElementById('choice2').style.display = 'block';
});
//When the second radio button is clicked do the following:
document.getElementById("Prog").addEventListener("click", function () {
  exer = false;
  prog = true;
  document.getElementById('choiceL').innerText = 'Choose number of days:';
  document.getElementById('choice2').style.display = 'none';
  document.getElementById('choice').style.display = 'block';
});
//When submit button is clicked do the following:
document.getElementById("submit-btn").addEventListener("click", function () {
  sendToChatGPT();
});



//Here is all the work
async function sendToChatGPT() {
  //Create the prompt
  if (exer) {
    let val = document.getElementById('choice2').value
    var value = `Assume that you're a professional bodybuilder trainer, give me a training program for ${val} while making the format like this:
    = Name of exercise.
    @ Sets x reps @
    ! How to preform in sentences.`
  } else if (!exer) {
    let val = document.getElementById('choice').value
    var value = `Assume that you're a professional bodybuilder trainer, give me a training program for ${val} days make sure every line doesn't start with a space and make sure that your response format is like this so i could parse it correctly:
    %Day number
    = Name of exercise.
    @ Sets x reps @
    ! How to preform in multiple sentences.`
  }
  //Define the options and send the prompt to ChatGPT
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: value }],
    }),
  };
  try {
    wait.setProperty('--display','inline-block')
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      options
    );
    const data = await response.json();
    //Wrap the message in a string.
    const messageContent = data.choices[0].message.content;
    console.log(messageContent)
    const exercises = parseExercises(messageContent);
    updateExerciseTable(exercises);
    console.log(exercises); // This will log an array of exercise information objects
    //Insert the message in respond html element which is a paragraph
    wait.setProperty('--display','none')
    //document.getElementById('respond').innerText = messageContent;

  } catch (error) {
    console.log(error)
    document.getElementById('respond').innerText = "Error: Cannot connect to ChatGPT";
  }

}

// Function to parse exercise information from GPT response
function parseExercises(messageContent) {
  // Split the message content into paragraphs
  const paragraphs = messageContent.split('\n');

  // Initialize an array to store parsed exercise information
  const parsedExercises = [];
  let currentExercise = null;

  for (const paragraph of paragraphs) {
    if (paragraph.startsWith('=')) {
      // A new exercise starts
      currentExercise = { name: '', sets: '', reps: '', instructions: '' };
      currentExercise.name = paragraph.substring(1).trim();
    } else if (currentExercise) {
      if (paragraph.includes('@')) {
        // Split the paragraph at the # sign to get sets and reps
        const [sets, reps] = paragraph.split('@');
        currentExercise.sets = sets.trim();
        currentExercise.reps = reps.trim();
      } else if (paragraph.startsWith('!')) {
        // Instructions
        currentExercise.instructions = paragraph.substring(1).trim();
        parsedExercises.push(currentExercise);
        currentExercise = null;
      }
    }
  }

  return parsedExercises;
}

// Function to update the HTML table with parsed exercises
function updateExerciseTable(parsedExercises) {
  // Get the table element by its ID
  const table = document.getElementById('exercise-table');

  // Clear existing table rows
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }

  // Iterate through the parsed exercises and populate the table
  for (const exercise of parsedExercises) {
    const newRow = table.insertRow(-1);
    const nameCell = newRow.insertCell(0);
    const setsRepsCell = newRow.insertCell(1);
    const instructionsCell = newRow.insertCell(2);
    const summarizedCell = newRow.insertCell(3);

    nameCell.innerHTML = exercise.name;
    setsRepsCell.innerHTML = `${exercise.sets} x ${exercise.reps}`;
    instructionsCell.innerHTML = exercise.instructions;
    
    const variableToSend = exercise.instructions; // Replace 'hello' with the variable you want to send
    const url = `/trainme?sentence=${encodeURIComponent(variableToSend)}`;

    fetch(url)
      .then((response) => response.text())
      .then((data) => {
      console.log(data); // You'll receive the response from the server
      summarizedCell.innerHTML = data;
    })
    .catch((error) => {
     console.error(error);
    });
  }
}
// In the sendToChatGPT function, after you receive the parsed exercises:
