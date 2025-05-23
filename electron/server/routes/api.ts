import { Router } from 'express';

const router = Router();

// GET /api/data - Example endpoint
router.get('/data', (_, res) => {
  // Sample data
  const data = {
    message: 'Hello from Express API!',
    timestamp: new Date().toISOString(),
    items: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' },
    ],
  };
  
  res.json(data);
});

// POST /api/items - Example endpoint to add an item
router.post('/items', (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  // In a real app, you would add to a database
  // For this example, we just return a success response
  res.status(201).json({
    id: Date.now(),
    name,
    createdAt: new Date().toISOString(),
  });
});

// Add more endpoints here

export const apiRoutes = router;