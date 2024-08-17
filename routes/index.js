const express = require('express');
const router = express.Router();
const { db } = require('../firebase/firebase');
const verifyToken = require('../middleware/authMiddleware');

const quotesCollection = db.collection('Joke');

// Get all quotes (Optional: Can be open to everyone)
router.get('/', async (req, res) => {
  try {
    const snapshot = await quotesCollection.get();
    const quotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single quote by ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await quotesCollection.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: 'Quote not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new quote (Protected)
router.post('/', async (req, res) => {
  try {
    const newQuote = {
      text: req.body.text,
      author: req.body.author,
      approved: false,
      id: req.body.id, // Add user ID to the quote
    };
    const docRef = quotesCollection.doc(req.body.id);
    console.log(docRef, 'asdkh')
    await docRef.set(newQuote);
    res.status(201).json({ id: docRef.id, ...newQuote });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a quote by ID (Protected)
router.put('/:id', verifyToken, async (req, res) => {
    
  try {
    const doc = await quotesCollection.doc(req.params.id).get();
    // console.log(doc.data(), 'ajskd')
    // if (!doc.exists || doc.data().userId !== req.user.uid) {
    //   return res.status(403).json({ message: 'Unauthorized to update this quote' });
    // }
    // console.log(req.body)

    let data = doc.data()
    let addedData = req.body

    const updatedQuote = {
      ...data, ...addedData
    };
    console.log(updatedQuote)

    await quotesCollection.doc(req.params.id).set(updatedQuote, { merge: true });
    res.json({ id: req.params.id, ...updatedQuote });
    moveDoc('Joke', 'Jokes', req.params.id )
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const moveDoc = async (sourceCollection, targetCollection, documentId) => {
  // const { sourceCollection, targetCollection, documentId } = req.body;

  try {
    // Step 1: Get the document from the source collection
    const sourceDocRef = db.collection(sourceCollection).doc(documentId);
    const docSnapshot = await sourceDocRef.get();

    if (!docSnapshot.exists) {
      console.log('operation not success')
      return
    }

    // Step 2: Get the data from the document
    const docData = docSnapshot.data();

    // Step 3: Add the document to the target collection
    const targetDocRef = db.collection(targetCollection).doc(documentId);
    await targetDocRef.set(docData);

    // Step 4: Delete the document from the source collection
    // await sourceDocRef.delete();

    // Respond with success
    // res.json({ message: 'Document successfully moved' });
    console.log('Document successfully moved');
  } catch (error) {
    console.error('Error moving document:', error);
    res.status(500).json({ message: 'An error occurred while moving the document' });
  }
};

// Delete a quote by ID (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const doc = await quotesCollection.doc(req.params.id).get();
    // if (!doc.exists || doc.data().userId !== req.user.uid) {
    //   return res.status(403).json({ message: 'Unauthorized to delete this quote' });
    // }

    await quotesCollection.doc(req.params.id).delete();
    res.json({ message: 'Quote deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
