const http = require('http');
const port = 3000;
const express = require('express');
const router = express.Router();
const path = require('path');
const app = express();
const nlp = require('compromise')
nlp.extend(require('compromise-sentences'));

app.use(express.json());

// Define a route to summarize a sentence sent from the client
router.get('/trainme', (req, res) => {
  const sentence = req.query.sentence;

  // Process the sentence using Compromise
  const doc = nlp(sentence);

  // Calculate weighted frequencies of words in the sentence using TF-IDF
  const wordWeights = calculateWordWeights(doc.text());

  // Extract the most significant sentence based on word weights
  const mostSignificantSentence = extractMostSignificantSentence(doc.sentences().out('array'), wordWeights);

  // Send the most significant sentence as the summary
  console.log('Original Sentence:', sentence);
  console.log('Summary:', mostSignificantSentence);

  res.send(mostSignificantSentence);
});

function calculateWordWeights(text) {
  // Calculate word weights using TF-IDF or any other weighting method
  // For this example, we use a simple word count as a weight
  const words = text.split(' ');
  const wordCounts = {};

  words.forEach((word) => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  return wordCounts;
}

function extractMostSignificantSentence(sentences, wordWeights) {
  let mostSignificantSentence = null;
  let highestWeight = 0;

  sentences.forEach((sentence) => {
    const weight = calculateSentenceWeight(sentence, wordWeights);

    if (weight > highestWeight) {
      highestWeight = weight;
      mostSignificantSentence = sentence;
    }
  });

  return mostSignificantSentence;
}

function calculateSentenceWeight(sentence, wordWeights) {
  // Calculate the combined weight of words in the sentence
  const wordsInSentence = sentence.split(' ');
  const weight = wordsInSentence.reduce((totalWeight, word) => {
    return totalWeight + (wordWeights[word] || 0);
  }, 0);

  return weight;
}

app.use('/', router);

app.use(express.static(path.join(__dirname, 'js')));
http.createServer(app).listen(port, () => {
    console.log(`listening on port ${port}...`)
})