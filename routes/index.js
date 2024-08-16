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
router.post('/', verifyToken, async (req, res) => {
  try {
    const newQuote = {
      content: req.body.content,
      author: req.body.author,
      approved: false,
      userId: req.user.uid, // Add user ID to the quote
    };
    const docRef = await quotesCollection.add(newQuote);
    res.status(201).json({ id: docRef.id, ...newQuote });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a quote by ID (Protected)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const doc = await quotesCollection.doc(req.params.id).get();
    if (!doc.exists || doc.data().userId !== req.user.uid) {
      return res.status(403).json({ message: 'Unauthorized to update this quote' });
    }

    const updatedQuote = {
      content: req.body.content,
      author: req.body.author,
      approved: req.body.approved,
    };

    await quotesCollection.doc(req.params.id).set(updatedQuote, { merge: true });
    res.json({ id: req.params.id, ...updatedQuote });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a quote by ID (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const doc = await quotesCollection.doc(req.params.id).get();
    if (!doc.exists || doc.data().userId !== req.user.uid) {
      return res.status(403).json({ message: 'Unauthorized to delete this quote' });
    }

    await quotesCollection.doc(req.params.id).delete();
    res.json({ message: 'Quote deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
