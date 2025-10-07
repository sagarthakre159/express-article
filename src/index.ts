import express , { Request, Response } from 'express'
import path from 'path'
import { s3Upload } from './upload.js'
import multer from 'multer'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import 'dotenv/config'; 

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


mongoose.connect(process.env.MONGO_URI, )

const userSchema = new mongoose.Schema({
  name: String,  
  age: Number,
});

const User = mongoose.model("User", userSchema);

// 3. Create a GET route
const app = express()
app.get("/users", async (req, res) => {
  try {
    const users = await User.find(); // fetch all users
    res.json(users);
  } catch (err) {
    res.status(500).send("Error fetching users");
  }
});

// Home route - HTML
app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Express on Vercel</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/api-data">API Data</a>
          <a href="/healthz">Health</a>
        </nav>
        <h1>Welcome to Express on Vercel 🚀</h1>
        <p>This is a minimal example without a database or forms.</p>
        <img src="/logo.png" alt="Logo" width="120" />
      </body>
    </html>
  `)
})

app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))
})

// Example API endpoint - JSON
app.get('/api-data', (req, res) => {
  res.json({
    message: 'Here is some sample API data',
    items: ['apple', 'banana', 'cherryy'],
  })
})

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})


interface UploadRequest extends Request {
    file: Express.Multer.File & { location: string };
}

// Define your Mongoose Schema to store the URL
const productSchema = new mongoose.Schema({
  productName: String,
  imageUrl: String, // Store the reference here!
});

const Product = mongoose.model('Product', productSchema);

app.post('/products', s3Upload.single('productImage'), async (req: UploadRequest, res: Response) => {
  try {
    // 1. Image has been uploaded to S3 by multer-s3-v3

    // 2. The URL/Location is returned in req.file.location
    const imageLocation = req.file.location; 
    const productName = req.body.productName; // Assuming you have body-parser/express.json() middleware for other fields

    // 3. Store the reference in MongoDB
    const newProduct = new Product({
      productName: productName,
      imageUrl: imageLocation, // <-- Storing the S3 URL
    });

    await newProduct.save();

    res.status(201).json({ 
      message: 'Product and image uploaded successfully!', 
      url: imageLocation 
    });
  } catch (error) {
    console.error('S3 Upload or DB Save Error:', error);
    res.status(500).send('Failed to upload product or image.');
  }
});


const PORT = process.env.PORT || 3000

// Start the server only if the file is run directly (not imported elsewhere)
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`)
        console.log(`Access it at http://localhost:${PORT}`)
    })
}


// NOTE: Keep the export default app for Vercel or other environments
export default app
