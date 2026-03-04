const express = require ('express');
const session = require('express-session');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const Tesseract = require('tesseract.js');
const cookieParser = require('cookie-parser');
const searchRoutes = require('./routes/searchRoutes'); // Path to your route file
const axios = require('axios');
const moment = require ('moment');
const { error } = require('console');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(require("cookie-parser")());
app.use(
  cors({
    origin: "https://magari-soko.vercel.app",
    credentials: true
  })
);

res.cookie("token", token, {
  httpOnly: true,
  secure: true, // IMPORTANT for production
  sameSite: "None" // REQUIRED for cross-site cookies
});

const upload = multer({ dest: 'uploads/' }); // the new images from the dealer updating form will be stored.

//const dealerVehicles = require('./models/DealerVehicles'); Adjust path as neededn

const client = new OAuth2Client('YOUR_GOOGLE_CLIENT_ID');
const SECRET_KEY = 'your_secret_key'; // Replace with your secret key

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));
//mongoose.connect('mongodb://localhost:27017/magarisoko', { 
//}).then(() => {
//console.log('Connected to MongoDB');
//}).catch((err) => {
//  console.error('Failed to connect to MongoDB:', err);
//});

// ================= MPESA CONFIG =================
const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,

  // Buy Goods Till Number
  shortcode: process.env.MPESA_TILL_NUMBER,

  // Production passkey (NOT sandbox one)
  passkey: process.env.MPESA_PASSKEY,

  // IMPORTANT: production API
  baseUrl: process.env.MPESA_BASE_URL || "https://api.safaricom.co.ke"
};


// Vehicle schema and model
const vehicleSchema = new mongoose.Schema({
  vehicle_images: [String],
  dealerId: String,
  vehicle_make: String,
  vehicle_model: String,
  vehicle_price: Number,
  color: String,
  status: String,
  Interior: String,
  vehicle_year: Number,
  kilometers: Number,
  transmission: String,
  type_of_fuel: String,
  engine_capacity: String,
  dealer_name: String,
  dealer_email: String,
  phone_number: String,
  dealer_id: String,
  dealer_email: String,
  mixedInput: String,
  vehicle_description: String
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

//magarisoko Vehicle schema and model
const MagariSchema = new mongoose.Schema({
  dealerId: String, // Assuming you want to associate the vehicle with a specific dealer
  vehicle_make: String,
  vehicle_model: String,
  vehicle_price: Number,
  color: String,
  Interior: String,
  status: String,
  dealer_id: String,
  kilometers: Number,
  transmission: String,
  dealer_name: String,
  dealer_email: String,
  phone_number: String,
  vehicle_year: String,
  type_of_fuel: String,
  engine_capacity: String,
  vehicle_description: String,
  vehicle_images: [String]// Array of image paths  
});

const Magari = mongoose.model('Magari', MagariSchema);

//code for creating a flash sale Schema and model 
// FlashSaleVehicles schema and model (same structure as Magari)
const FlashSaleVehicle = mongoose.model('FlashSaleVehicle', MagariSchema);

// Vehicles for Hire schema and model
const carHireSchema = new mongoose.Schema({
  vehicle_make: String,
  vehicle_model: String,
  vehicle_price: Number,
  color: String,
  Interior: String,
  status: String,
  kilometers: Number,
  transmission: String,
  Year: String,
  dealer_name: String,
  phone_number: String,
  vehicle_year: String,
  type_of_fuel: String,
  engine_capacity: String,
  vehicle_description: String,
  vehicle_images: [String]// Array of image paths  
});

const CarHire = mongoose.model('CarHire', carHireSchema);

// Dealer schema and model
const dealerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  phone_number: { type: String, required: true },
  email: { type: String, required: true },
  id_no: { type: String, required: true },
  address: { type: String, required: true }
});

const Dealer = mongoose.model('Dealer', dealerSchema);

// Endpoint to get dealers
app.get('/api/dealers', async (req, res) => {
  try {
      const dealers = await Dealer.find();
      res.json(dealers);
  } catch (error) {
    // The catch block is used to handle any errors that occur during the execution of the try block.
    // It logs the error and sends an appropriate response to the client.
      res.status(500).json({ message: error.message });
  }
});

// User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  googleId: { type: String, unique: true, sparse: true }
});

const User = mongoose.model('User', userSchema);

//code for the posting of the vehicles from the dealers dashboard
// Define a DealerVehicle schema
const dealerVehicleSchema = new mongoose.Schema({
  dealerId: String, // Assuming you want to associate the vehicle with a specific dealer
  vehicle_make: String,
  vehicle_model: String,
  vehicle_price: Number,
  dealer_name: String,
  color: String,
  Interior: String,
  status: String,
  kilometers: Number,
  transmission: String,
  dealer_email: String,
  phone_number: String,
  vehicle_year: String,
  type_of_fuel: String,
  engine_capacity: String,
  vehicle_description: String,
  vehicle_images: [String]// Array of image paths
});

const DealerVehicle = mongoose.model('DealerVehicle', dealerVehicleSchema);


module.exports = DealerVehicle;

//Subscription schema and model
const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    plan: {
        type: String,
        enum: ['basic', 'standard', 'premium'],
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    // cache user info at time of subscription
    username: {
      type: String
    },

    email: {
      type: String
    },

    phone_number: {
      type: String
    },

    status: {
        type: String,
        enum: ['active', 'expired'],
        default: 'active'
    },

    startDate: {
        type: Date,
        default: Date.now
    },

    expiryDate: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

//pending subscription schema and model
const PendingSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  checkoutRequestID: {
    type: String,
    required: true,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    default: 'pending'
  },
  vehicleData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  isDealer: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // auto-delete after 7 days (in seconds)
  }
});

const PendingSubscription = mongoose.model(
  'PendingSubscription',
  PendingSubscriptionSchema
);

//Dealer subscription schema and model
const dealerSubscriptionSchema = new mongoose.Schema({
    dealerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dealer',
        required: true
    },
    plan: {
        type: String,
        enum: ['basic', 'standard', 'premium'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    username: {
      type: String
    },
    email: {
      type: String
    },
    phone_number: {
      type: String
    },
    status: {
        type: String,
        enum: ['active', 'expired'],
        default: 'active'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

const DealerSubscription = mongoose.model('DealerSubscription', dealerSubscriptionSchema);

//Getting DealerVehicles 
// Set up session middleware
app.use(session({
  secret: '7d5c31e6d3c6efea1c6c0b4b6e3d7b8a51e2f45a5d9b9b6d7b5c5b3d8e1c3a2f', // Replace with a secure secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'No token' });
    }

    const decoded = jwt.verify(token, SECRET_KEY);

    console.log('Decoded JWT:', decoded);

    if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return res.status(401).json({ message: 'Invalid user ID in token' });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Handle the Admin login
app.post('/admin-login', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Set secure cookie/token or session
      res.json({ success: true, redirect: "/admin.html" });
  } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Register Routes
app.use('/api', searchRoutes);

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Set up multer for sell.html file uploads
const sellStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(uploadsDir, 'sell_uploads'));  // Store sell uploads in a specific folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);  // Generate a unique filename
  }
});
const uploadSell = multer({ storage: sellStorage });

// Set up multer for dealers.html file uploads
const dealerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(uploadsDir, 'dealer_uploads'));  // Store dealer uploads in a specific folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);  // Generate a unique filename
  }
});
const uploadDealer = multer({ storage: dealerStorage });

// Serve static files (e.g., your HTML files)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Verify dealer endpoint
app.post('/verify-dealer', async (req, res) => {
    const { dealer_name, dealer_id } = req.body;

    try {
        const dealer = await Dealer.findOne({ username: dealer_name, id_no: dealer_id });
        if (dealer) {
            res.status(200).json({ verified: true });
        } else {
            res.status(404).json({ verified: false, message: 'Dealer not found' });
        }
    } catch (error) {
        console.error('Error verifying dealer:', error);
        res.status(500).json({ verified: false, message: 'An error occurred while verifying the dealer' });
    }
});

// Handle POST request to /api/vehicles
// Route for handling sell.html form submissions
app.post('/api/vehicles', authenticateToken, uploadDealer.array('dealer_vehicle_image', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files were uploaded.' });
    }

    const imagePaths = req.files.map(file => 'uploads/dealer_uploads/' + file.filename);

    const vehicle = new Vehicle({
      dealerId: req.user?._id || req.body.dealerId,
      vehicle_make: req.body.vehicle_make,
      vehicle_model: req.body.vehicle_model,
      vehicle_price: req.body.vehicle_price,
      dealer_name: req.body.dealer_name,
      dealer_id: req.body.dealer_id,
      status: req.body.status,
      color: req.body.color,
      Interior: req.body.Interior,
      kilometers: req.body.kilometers,
      transmission: req.body.transmission,
      phone_number: req.body.phone_number || req.user?.phone_number,
      dealer_email: req.body.dealer_email || req.user?.email,
      vehicle_year: req.body.vehicle_year,
      type_of_fuel: req.body.type_of_fuel,
      engine_capacity: req.body.engine_capacity,
      vehicle_description: req.body.vehicle_description,
      vehicle_images: imagePaths
    });

    await vehicle.save();
    res.status(200).json({ success: true, message: 'Vehicle uploaded successfully.' });
  } catch (error) {
    console.error('Error uploading vehicle:', error);
    res.status(500).json({ success: false, message: 'An error occurred during vehicle upload.' });
  }
});

// Search API in Home page
app.post('/search', async (req, res)=>{
  const searchTerm = req.body.query;

  try{
    //case-insensitive search using regular expressions
    const regex = new RegExp(searchTerm, 'i');

    const results = await Promise.all([
      Vehicle.find({ $or: [{vehicle_make: regex }, {vehicle_model: regex }, { vehicle_description: regex}] }),
      Magari.find({ $or: [{ vehicle_make: regex }, {vehicle_model: regex }, {vehicle_description: regex}] }),
      DealerVehicle.find({ $or: [{ vehicle_make: regex }, {vehicle_model: regex }, {vehicle_description: regex}] }),
      FlashSaleVehicle.find({ $or: [{ vehicle_make: regex }, {vehicle_model: regex }, {vehicle_description: regex}] }),
    ]);

    //combine and send results
    const combineResults = [...results[0], ...results[1],...results[2],...results[3]];
    res.status(200).json({ success: true, data: combineResults });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'server Error' });
  }
});


//Search API in the Carhire page 
app.get('/api/searchHire', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    // Convert the query to a number if it might represent a price
    const queryNumber = parseFloat(query);

    // Case-insensitive search for string fields
    const results = await CarHire.find({
      $or: [
        { vehicle_make: { $regex: query, $options: 'i' } },
        { vehicle_model: { $regex: query, $options: 'i' } },
        { type_of_fuel: { $regex: query, $options: 'i' } },
        { engine_capacity: { $regex: query, $options: 'i' } },
        { vehicle_description: { $regex: query, $options: 'i' } },
        ...(isNaN(queryNumber)
          ? []
          : [{ vehicle_price: queryNumber }]) // Match exact price if the query is a number
      ]
    });

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: "An error occurred during the search" });
  }
});

//Route to get the vehicles in the Vehicle collction in the MongoDB
app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find(); // Use async/await
    res.status(200).json(vehicles);
} catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).send(err);
}
});

// Endpoint for fetching vehicle in the vehicle collection and displaying it in the car details page
app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({success: false, message: 'Vehicle not found'});
    }
    res.json({ success: true, vehicle});
  } catch (error) {
    console.error('Error fetching vehicle details:', error);
    res.status(500).json({ success: false, message: 'An error occurred whil fetching the vehicle details'});
  }
});

//Fetch all vehicles by their ID number 
app.get('/api/vehicles/:vehicleId', async (req, res) => {
  try {
    const { vehicleId } = req.params;

    // Fetch vehicle by ID from the database
    const vehicle = await Vehicle.findById(vehicleId);

    // If no vehicle is found, return 404 error
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Return the vehicle details
    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ success: false, message: 'An error occurred while fetching the vehicle' });
  }
});


//code for retrieving vehicles based on their make and posting them on the relevant make webpage
//Route to get vehicles by make
app.get('/vehicles/make/:make', async (req, res) =>{
  const vehicleMake = req.params.make;//'make' comes from the URL
  try{
    //Query MongoDB to find vehicles by make
    const vehicles = await Vehicle.find({make: vehicleMake });
    res.json(vehicles); //send the vehicle data back as json
  } catch (error) {
    res.status(500).send('Error retrieving vehicles.');
  }
});

//code for fetching the vehicles by their ID and place them in the Admin Modal
app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    console.error('Error fetching vehicle by ID:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//Fetch vehicles for the logged-in User and display them in the user.html page 
// Fetch vehicles for the logged-in user
app.get('/api/user-vehicles', authenticateToken, async (req, res) => {
  try {
    const username = req.user.username; // ✅ comes from JWT middleware

    // Match vehicles belonging to this user
    const vehicles = await Vehicle.find({ dealer_name: username });

    res.json({
      success: true,
      vehicles: Array.isArray(vehicles) ? vehicles : []
    });

  } catch (error) {
    console.error('Error fetching user vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicles'
    });
  }
});


//Code for updating the vehicles in the Vehicle collection
app.put('/api/vehicles/:id', async (req, res) => {
  const vehicleId = req.params.id;
  const updatedVehicle = {
    vehicle_make: req.body.vehicle_make,
    vehicle_model: req.body.vehicle_model,
    vehicle_price: req.body.vehicle_price,
    status: req.body.status,
    color: req.body.color,
    Interior: req.body.Interior,
    kilometers: req.body.kilometers,
    transmission: req.body.transmission,
    type_of_fuel: req.body.type_of_fuel,
    engine_capacity: req.body.engine_capacity,
    vehicle_description: req.body.vehicle_description,
  };

  try {
    // Check if new images are uploaded
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(file => `/uploads/${file.filename}`);
      updatedVehicle.vehicle_images = newImagePaths;
    }

    // Update the vehicle in the Vehicle collection
    const result = await Vehicle.findByIdAndUpdate
    (vehicleId, updatedVehicle, { new: true });
    if (result) {
      res.json({ success: true, message: 'Vehicle details updated successfully.' });
    }
    else {
      res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ success: false, message: 'An error occurred while updating the vehicle.' });
  }
});

//code for deleting vehicles from the Vehicle collection
app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

//Below code are deleting and editing vehicles as from the user dashboard.html
// DELETE vehicle
app.delete('/api/User-vehicles/:id', async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ success: false });
  }
});

// UPDATE vehicle
app.put('/api/User-vehicles/:id', async (req, res) => {
  try {
    await Vehicle.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ success: false });
  }
});


//code for the loading of the form input FROM the dealers dashboard  into the MongoDB
// POST route to add a new dealer vehicle
// Route for handling dealers.html form submissions
app.post('/api/dealerVehicles', uploadDealer.array('dealer_vehicle_image', 10), async (req, res) => {
  try {
      // Check if files are uploaded
      if (!req.files || req.files.length === 0) {
          return res.status(400).json({ success: false, message: 'No files were uploaded.' });
      }

      // Map through the files to get their paths
      const imagePaths = req.files.map(file => 'uploads/dealer_uploads/' + file.filename);

      // Create a new Vehicle document
      const vehicle = new DealerVehicle({
          dealerId: req.body.dealerId,
          vehicle_make: req.body.vehicle_make,
          vehicle_model: req.body.vehicle_model,
          vehicle_price: req.body.vehicle_price,
          status: req.body.status,
          color: req.body.color,
          Interior: req.body.Interior,
          kilometers: req.body.kilometers,
          transmission: req.body.transmission,
          dealer_name: req.body.dealer_name,
          dealer_email: req.body.dealer_email,
          phone_number: req.body.phone_number,
          vehicle_year: req.body.vehicle_year,
          type_of_fuel: req.body.type_of_fuel,
          engine_capacity: req.body.engine_capacity,
          vehicle_description: req.body.vehicle_description,
          vehicle_images: imagePaths // Save array of image paths in MongoDB
      });

      // Save the vehicle to the database
      await vehicle.save();

      res.json({ success: true, message: 'Vehicle uploaded successfully.' });
    } catch (error) {
      console.error('Error uploading vehicle:', error);
      res.status(500).json({ success: false, message: 'An error occurred during vehicle upload.' });
    }
  }); 

//Mpesa integration code
// we need to create an https.Agent in case the TCP connection is
// disrupted by TLS validation issues (ngrok, self‑signed certs, etc.).
// only disable verification in non‑production environments.
const https = require('https');

async function getMpesaAccessToken() {
    const auth = Buffer.from(
        MPESA_CONFIG.consumerKey + ':' + MPESA_CONFIG.consumerSecret
    ).toString('base64');

    // log base url for debugging
    console.log('Obtaining access token from', MPESA_CONFIG.baseUrl);

    const agent = new https.Agent({
        rejectUnauthorized: process.env.NODE_ENV === 'production'
    });

    const response = await axios.get(
        `${MPESA_CONFIG.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
            headers: {
                Authorization: `Basic ${auth}`
            },
            httpsAgent: agent
        }
    );

    return response.data.access_token;
}

async function initiateSTKPush({ phone, amount, accountRef, callbackUrl }) {
    const token = await getMpesaAccessToken();
    const timestamp = moment().format('YYYYMMDDHHmmss');

    const password = Buffer.from(
        MPESA_CONFIG.shortcode +
        MPESA_CONFIG.passkey +
        timestamp
    ).toString('base64');

    // We also log the callback URL and baseUrl for visibility
    console.log('Initiating STK push to', MPESA_CONFIG.baseUrl, 'callback:', callbackUrl);

    const agent = new https.Agent({
        rejectUnauthorized: process.env.NODE_ENV === 'production'
    });

    try {
        return await axios.post(
            `${MPESA_CONFIG.baseUrl}/mpesa/stkpush/v1/processrequest`,
            {
                BusinessShortCode: MPESA_CONFIG.shortcode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: amount,
                PartyA: phone,
                PartyB: MPESA_CONFIG.shortcode,
                PhoneNumber: phone,
                CallBackURL: callbackUrl,
                AccountReference: accountRef,
                TransactionDesc: 'Subscription Payment'
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                httpsAgent: agent,
                timeout: 15000 // 15 seconds
            }
        );
    } catch (err) {
        // rethrow with more context so callers can log
        console.error('initiateSTKPush failed', err.message || err);
        throw err;
    }
}

//getting dealer vehicles from collection 
app.get('/api/dealerVehicles', async (req, res) => {
  try{
    const vehicles = await DealerVehicle.find(); // Use async/await
    res.status(200).json(vehicles);
} catch (error) {
    console.error('Error fetching dealer vehicles:', error);
    res.status(500).send(err);
}
});

// Fetch vehicles for the logged-in dealer and display them in the dealer.html page
// Fetch vehicles for the logged-in dealer
app.get('/dealer-vehicles', async (req, res) => {
  try {
      const dealerEmail = req.session.dealerEmail;

      if (!dealerEmail) {
          return res.status(400).json({ success: false, message: 'Dealer email not found in session.' });
      }

      const vehicles = await DealerVehicle.find({ dealer_email: dealerEmail });

      if (Array.isArray(vehicles)) {
          res.json({ success: true, vehicles });
      } else {
          res.json({ success: true, vehicles: [] });
      }
  } catch (error) {
      console.error('Error fetching dealer vehicles:', error);
      res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
});



//Endpoint to fetch vehicle details in the dealers collection
app.get('api/dealerVehicle/:id', async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const vehicle = await DealerVehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({success: false, message: 'Vehicle not found'});
    }
    res.json({ success: true, vehicle});
  } catch (error) {
    console.error('Error fetching vehicle details:', error);
    res.status(500).json({ success: false, message: 'An error occurred whil fetching the vehicle details'});
  }
});


//fetch all vehicles by their ID in the Dealers collection
app.get('/api/dealerVehicles/:vehicleId', async (req, res) => {
  const { vehicleId } = req.params;
  try {
      const vehicle = await DealerVehicle.findById(vehicleId);
      if (!vehicle) {
          return res.status(404).json({ success: false, message: 'Vehicle not found.' });
      }
      res.json({ success: true, vehicle });
  } catch (error) {
      console.error('Error fetching vehicle:', error);
      res.status(500).json({ success: false, message: 'An error occurred while fetching the vehicle.' });
  }
});

//Code for getting the vehicles by their ID and place them in the Admin Modal
app.get('/api/dealerVehicles/:id', async (req, res) => {
  try {
    const vehicle = await DealerVehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    console.error('Error fetching vehicle by ID:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//code for updating the vehicles in the DealerVehicle collection
app.put('/api/dealerVehicles/:id', async (req, res) => {
  const vehicleId = req.params.id;
  const updatedVehicle = {
    vehicle_make: req.body.vehicle_make,
    vehicle_model: req.body.vehicle_model,
    vehicle_price: req.body.vehicle_price,
    type_of_fuel: req.body.type_of_fuel,
    engine_capacity: req.body.engine_capacity,
    vehicle_description: req.body.vehicle_description,
    dealer_name: req.body.dealer_name,
    status: req.body.status,
    color: req.body.color,
    Interior: req.body.Interior,
    kilometers: req.body.kilometers,
    transmission: req.body.transmission,
    vehicle_year: req.body.vehicle_year,
  };

  try {
    // Check if new images are uploaded
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(file => `/uploads/${file.filename}`);
      updatedVehicle.vehicle_images = newImagePaths;
    }

    // Update the vehicle in the DealerVehicle collection
    const result = await DealerVehicle.findByIdAndUpdate(vehicleId, updatedVehicle, { new: true });
    if (result) {
      res.json({ success: true, message: 'Vehicle details updated successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ success: false, message: 'An error occurred while updating the vehicle.' });
  }
});

// Route to delete a vehicle in the DealerVehicle collection from the Admin.html
app.delete('/api/dealerVehicles/:id', async (req, res) => {
  try {
      const vehicleId = req.params.id;
      const result = await DealerVehicle.findByIdAndDelete(vehicleId);
      if (result) {
          res.status(200).send({ message: 'Vehicle deleted successfully' });
      } else {
          res.status(404).send({ message: 'Vehicle not found' });
      }
  } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).send({ message: 'An error occurred while deleting the vehicle' });
  }
});


// POST route to add a new Admin Vehicle
app.post('/api/magari', uploadDealer.array('dealer_vehicle_image', 10), async (req, res) => {
  try {
    // Check if files are uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files were uploaded.' });
    }

    // Map through the files to get their paths
    const imagePaths = req.files.map(file => 'uploads/dealer_uploads/' + file.filename);

    // Create a new Vehicle document
    const vehicle = new Magari({
      dealerId: req.body.dealerId,
      vehicle_make: req.body.vehicle_make,
      vehicle_model: req.body.vehicle_model,
      vehicle_price: req.body.vehicle_price,
      dealer_name: req.body.dealer_name,
      dealer_email: req.body.dealer_email,
      phone_number: req.body.phone_number,
      status: req.body.status,
      color: req.body.color,
      Interior: req.body.Interior,
      kilometers: req.body.kilometers,
      transmission: req.body.transmission,
      vehicle_year: req.body.vehicle_year,
      type_of_fuel: req.body.type_of_fuel,
      engine_capacity: req.body.engine_capacity,
      vehicle_description: req.body.vehicle_description,
      vehicle_images: imagePaths // Save array of image paths in MongoDB
    });

    // Save the vehicle to the database
    await vehicle.save();

    // Send success response
    res.status(200).json({ success: true, message: 'Vehicle uploaded successfully.' });
  } catch (error) {
    // Log and send error response
    // The catch block is used to handle any errors that occur during the execution of the try block.
    // It logs the error and sends an appropriate response to the client.
    console.error('Error uploading vehicle:', error);
    res.status(500).json({ success: false, message: 'An error occurred during vehicle upload.' });
  }
});

//EndPoint to fetch vehicle details in the Magaris collection
app.get('/api/magari/:id', async (req, res) =>{
try {
  const vehicleId = req.params.id;
  const vehicle = await Magari.findById(vehicleId);

  if (!vehicle) {
    return res.status(400).json({success:  false, message: 'Vehicle not found'});
  }
  res.json({ success: true, vehicle});
} catch (error) {
  console.error('Error fetching vehicle details:', error);
  res.status(500).json({ success: false, message: 'An error occurred while fetching the vehicle details'});
}
});

//Get route to fetch all MagariSoko vehicles
app.get('/api/magari', async (req, res) =>{
  try{
    const vehicles = await Magari.find(); // Use async/await
    res.status(200).json(vehicles);
} catch (error) {
    console.error('Error fetching dealer vehicles:', error);
    res.status(500).send(err);
}
});

//The code below is used to move selected vehicles for flash sale collection from the magaris collection to the flash sale collection
// Update flash sale selection
app.post('/api/flash-sale', async (req, res) => {
  const { flashSaleVehicleIds } = req.body;

  // Move selected vehicles to FlashSaleVehicles collection
  const flashSaleVehicles = await Magari.find({ _id: { $in: flashSaleVehicleIds } });
  await FlashSaleVehicle.insertMany(flashSaleVehicles);

  // Remove selected vehicles from Magari collection
  await Magari.deleteMany({ _id: { $in: flashSaleVehicleIds } });

  res.status(200).json({ message: 'Flash sale selection updated' });
});

// Code for getting Flash sale vehicles from the FlashSaleVehicle collection
app.get('/api/flash-sale', async (req, res) => {
  try {
      const flashSaleVehicles = await FlashSaleVehicle.find();
      res.json(flashSaleVehicles);
  } catch (error) {
      console.error('Error fetching flash sale vehicles:', error);
      res.status(500).json({ message: 'An error occurred while fetching flash sale vehicles' });
  }
});

//Endpoint to fetch vehicle details in the FlashSaleVehicle collection
// Fetch a specific flash sale vehicle by ID from FlashSaleVehicles collection
app.get('/api/flash-sale-vehicles/:id', async (req, res) => {
  try {
    const vehicleId = req.params.id
      const vehicle = await FlashSaleVehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({success: false, message: 'Vehicle not found'});
      }
      res.json({ success: true, vehicle});
  } catch (error) {
    console.error('Error fetching vehicle details:', error);
      res.status(500).json({ message: 'Failed to fetch vehicle details', error });
  }
});

//End point thet fetches FlashSale vehicles for the Admin editng 
app.get('/api/flash-sale/:id', async (req, res) => {
  try{
    const vehicleId = req.params.id;
    const vehicle = await FlashSaleVehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({message: 'Vehicle not found'});
    }
    res.json({ success: true, vehicle});
  } catch (error) {
    console.error('Error fetching vehicle details:', error);
    res.status(500).json({ success: false, message: 'An error occurred while fetching the vehicle details'});
  }
  });

//Code for deleting vehicles from the FlashSaleVehicle collection
app.delete('/api/flash-sale/:id', async (req, res) => {
  try {
    await FlashSaleVehicle.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

//Code for updating the vehicles in FlashSale vehicle Collection with new data (newVehicle price)
app.put("/api/flash-sale/:id", async (req, res) => {
  try {
      const vehicleId = req.params.id;
      const updateData = req.body; // Get all updated fields from request

      // Update the vehicle document
      const updatedVehicle = await FlashSaleVehicle.findByIdAndUpdate(
          vehicleId,
          { $set: updateData }, // Update all fields provided in request
          { new: true, upsert: true } // Return updated document & create if not exist
      );

      res.json({ success: true, updatedVehicle });
  } catch (error) {
      console.error("Error updating vehicle:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Route to get vehicle by ID from the magaris collection
app.get('/api/magari/:vehicleId', async (req, res) => {
  const { vehicleId } = req.params;
  try {
      const vehicle = await Magari.findById(vehicleId);
      if (!vehicle) {
          return res.status(404).json({ error: 'Vehicle not found' });
      }
      res.json(vehicle);
  } catch (err) {
      console.error('Error fetching vehicle:', err);
      res.status(500).json({ error: 'Internal server error' });
  }
});


//Route to getting vehicles by their Id and place them in Admin Modal
app.get('/api/magari/:id', async (req, res) => {
  try {
      const vehicle = await Magari.findById(req.params.id);
      if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
      res.json(vehicle);
  } catch (err) {
      console.error('Error fetching vehicle by ID:', err);
      res.status(500).json({ message: 'Internal server error' });
  }
});

//code for updating the vehicles in the Magari collection
app.put('/api/magariEdits/:id', async (req, res) => {
  const vehicleId = req.params.id;
  const updatedVehicle = {
    vehicle_make: req.body.vehicle_make,
    vehicle_model: req.body.vehicle_model,
    vehicle_price: req.body.vehicle_price,
    status: req.body.status,
    color: req.body.color,
    Interior: req.body.Interior,
    kilometers: req.body.kilometers,
    transmission: req.body.transmission,
    type_of_fuel: req.body.type_of_fuel,
    engine_capacity: req.body.engine_capacity,
    vehicle_description: req.body.vehicle_description,
  };

  try {
    // Check if new images are uploaded
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(file => `/uploads/${file.filename}`);
      updatedVehicle.vehicle_images = newImagePaths;
    }

    // Update the vehicle in the Magari collection
    const result = await Magari.findByIdAndUpdate(vehicleId, updatedVehicle, { new: true });
    if (result) {
      res.json({ success: true, message: 'Vehicle details updated successfully.' });
    }
    else {
      res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ success: false, message: 'An error occurred while updating the vehicle.' });
  }
});



//code for deleting vehicles from the Magari collection
app.delete('/api/magari/:id', async (req, res) => {
  try {
    await Magari.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

//POST route to add a new Vehicle for hire
app.post ('/api/magariHire', uploadDealer.array('dealer_vehicle_image', 10), async (req, res) => {
  try {
    // Check if files are uploaded
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files were uploaded.' });
    }

    // Map through the files to get their paths
    const imagePaths = req.files.map(file => 'uploads/dealer_uploads/' + file.filename);

    // Create a new Vehicle document
    const vehicle = new CarHire({
        dealerId: req.body.dealerId,
        vehicle_make: req.body.vehicle_make,
        vehicle_model: req.body.vehicle_model,
        vehicle_price: req.body.vehicle_price,
        dealer_name: req.body.dealer_name,
        status: req.body.status,
        color: req.body.color,
        Interior: req.body.Interior,
        kilometers: req.body.kilometers,
        transmission: req.body.transmission,
        phone_number: req.body.phone_number,
        vehicle_year: req.body.vehicle_year,
        type_of_fuel: req.body.type_of_fuel,
        engine_capacity: req.body.engine_capacity,
        vehicle_description: req.body.vehicle_description,
        vehicle_images: imagePaths // Save array of image paths in MongoDB
      });

      // Save the vehicle to the database
      await vehicle.save();

      // Send success response
    res.status(200).json({ success: true, message: 'Vehicle uploaded successfully.' });
  } catch (error) {
    // Log and send error response
    console.error('Error uploading vehicle:', error);
    res.status(500).json({ success: false, message: 'An error occurred during vehicle upload.' });
  }
});


//Get route to fetch all Vehicles for Hire
app.get('/api/magariHire', async (req, res) =>{
  try{
    const vehicles = await CarHire.find();
    res.status(200).json(vehicles);
  } catch (error) {
    console.error('Error fetching dealer vehicles:', err);
    res.status(500).send(err);
  }
});

//Endpoint to fetch vehicle details in the dealers collection
app.get('/api/magariHire/:id', async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const vehicle = await CarHire.findById(vehicleId);

    if (!vehicle){
      return res.status(400).json({success: false, message: 'vehicle not found'});
    }
    res.json({ success: true, vehicle});
  } catch (error) {
    console.error('Error fetching vehicle details:', error);
    res.status(500).json({success: false, message: 'An error occurred while fetching the vehicle details'});
  }
});


//Fetch all Hire vehicles by ID name
app.get('/api/magariHire/:vehicleId', async (req, res) =>{
  const { vehicleId } = req.params;
  try{
    const vehicle = await CarHire.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//code for updating the vehicles in the CarHire collection
app.put('/api/magariHire/:id', async (req, res) => {
  const vehicleId = req.params.id;
  const updatedVehicle = {
    vehicle_make: req.body.vehicle_make,
    vehicle_model: req.body.vehicle_model,
    vehicle_price: req.body.vehicle_price,
    status: req.body.status,
    color: req.body.color,
    Interior: req.body.Interior,
    kilometers: req.body.kilometers,
    transmission: req.body.transmission,
    type_of_fuel: req.body.type_of_fuel,
    engine_capacity: req.body.engine_capacity,
    vehicle_description: req.body.vehicle_description,
  };

  try {
    // Check if new images are uploaded
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(file => `/uploads/${file.filename}`);
      updatedVehicle.vehicle_images = newImagePaths;
    }

    // Update the vehicle in the CarHire collection
    const result = await CarHire.findByIdAndUpdate(vehicleId, updatedVehicle, { new: true });
    if (result) {
      res.json({ success: true, message: 'Vehicle details updated successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ success: false, message: 'An error occurred while updating the vehicle.' });
  }
});
//code for deleting vehicles from the CarHire collection
app.delete('/api/magariHire/:id', async (req, res) => {
  try {
    await CarHire.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});


// Update vehicle details for dealer vehicles through the dealer.html
// Get vehicle details by ID
app.put('/api/editVehicle/:id', upload.array('newImages', 10), async (req, res) => {
  const vehicleId = req.params.id;
  const updatedVehicle = {
      vehicle_make: req.body.vehicle_make,
      vehicle_model: req.body.vehicle_model,
      vehicle_price: req.body.vehicle_price,
      status: req.body.status,
      color: req.body.color,
      Interior: req.body.Interior,
      kilometers: req.body.kilometers,
      transmission: req.body.transmission,
      type_of_fuel: req.body.type_of_fuel,
      engine_capacity: req.body.engine_capacity,
      vehicle_description: req.body.vehicle_description,
  };

  try {
      // Check if new images are uploaded
      if (req.files && req.files.length > 0) {
          const newImagePaths = req.files.map(file => `/uploads/${file.filename}`);
          updatedVehicle.vehicle_images = newImagePaths;
      }

      // Update the vehicle in the dealerVehicles collection
      const result = await DealerVehicle.findByIdAndUpdate(vehicleId, updatedVehicle, { new: true });
      if (result) {
          res.json({ success: true, message: 'Vehicle details updated successfully.' });
      } else {
          res.status(404).json({ success: false, message: 'Vehicle not found.' });
      }
  } catch (error) {
      console.error('Error updating vehicle:', error);
      res.status(500).json({ success: false, message: 'An error occurred while updating the vehicle.' });
  }
});


// Endpoint to fetch all Toyota vehicles
app.get('/api/vehicles/toyota', async (req, res) => {
  try {
      // Fetch Toyota vehicles from all three collections
      const magariVehicles = await Magari.find({ vehicle_make: 'Toyota' });
      const dealerVehicles = await DealerVehicle.find({ vehicle_make: 'Toyota' });
      const otherVehicles = await Vehicle.find({ vehicle_make: 'Toyota' });

      // Combine all results into a single array
      const allToyotaVehicles = [...magariVehicles, ...dealerVehicles, ...otherVehicles];

      res.json({ success: true, vehicles: allToyotaVehicles });
  } catch (error) {
      console.error('Error fetching Toyota vehicles:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// GET route to fetch all dealer vehicles
app.get('/api/dealerVehicles', async (req, res) => {
  try {
      const vehicles = await DealerVehicle.find(); // Use async/await
      res.status(200).json(vehicles);
  } catch (err) {
      console.error('Error fetching dealer vehicles:', err);
      res.status(500).send(err);
  }
});

// Delete vehicle(from DealerVehicles collection)
app.delete('/api/dealerVehicles/:id', async (req, res) => {
  try {
      await DealerVehicle.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

//code that displays vehicles by make in the various vehiclemake webpages
app.get('/vehicles/:type', async (req, res) => {
  const vehicleType = req.params.type;

  try {
      const magarisVehicles = await Magari.find({ vehicle_make: vehicleType });
      const vehicles = await Vehicle.find({ vehicle_make: vehicleType });
      const dealerVehicles = await DealerVehicle.find({ vehicle_make: vehicleType });

      // Combine and return results
      const allVehicles = [...magarisVehicles, ...vehicles, ...dealerVehicles];
      res.json(allVehicles);
  } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Handle dealer sign-up
app.post('/signD', uploadDealer.array('images'), async (req, res) => {
  try {
    const { username, id_no, email } = req.body;
    const images = req.files;

    // Check if a dealer with the same email or ID number already exists
    const existingDealer = await Dealer.findOne({ $or: [{ email }, { id_no }] });

    if (existingDealer) {
      // If a match is found, send a response indicating the dealer has already signed up
      return res.json({ success: false, message: 'Already signed up, proceed to login!' });
    }

    let idCardData = '';

    // Process ID card images using Tesseract
    for (const image of images) {
      const text = await Tesseract.recognize(image.path, 'eng');
      idCardData += text.data.text;
      fs.unlinkSync(image.path); // Remove the image after processing
    }

    // Check if the ID card data matches the input username and ID number
    if (!idCardData.includes(username) || !idCardData.includes(id_no)) {
      return res.json({ success: false, message: 'ID details do not match the input data.' });
    }

    // Prepare the new dealer data
    const dealerData = {
      username,
      phone_number: req.body.phone_number,
      email,
      id_no,
      address: req.body.address
    };

    // Save the new dealer
    const newDealer = new Dealer(dealerData);
    await newDealer.save();

    // Send a success response
    res.json({ success: true, message: 'Submission successful. Proceed to login!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
});


//Route of getting the dealer by ID
app.get('/api/dealers/:id', async (req, res) => {
  try {
      const dealer = await Dealer.findById(req.params.id);
      if (!dealer) return res.sthon({ message: 'Dealer not found' });
      res.status(200).json(dealer);
  } catch (error) {
    console.error('Error fetching dealer:', error);
    res.status(500).json({ message: 'An error occurred while fetching the dealer' });
  }
});



// Route to delete a dealer
app.delete('/api/dealers/:id', async (req, res) => {
  try {
      const dealerId = req.params.id;
      const result = await Dealer.findByIdAndDelete(dealerId);
      if (result) {
          res.status(200).send({ message: 'Dealer deleted successfully' });
      } else {
          res.status(404).send({ message: 'Dealer not found' });
      }
  } catch (error) {
      console.error('Error deleting dealer:', error);
      res.status(500).send({ message: 'An error occurred while deleting the dealer' });
  }
});

// Route to update a dealer details
app.put('/api/dealers/:id', async (req, res) => {
  try {
      const dealerId = req.params.id;
      const updatedDealer = req.body;
      const result = await Dealer.findByIdAndUpdate(dealerId, updatedDealer, { new: true });
      if (result) {
          res.status(200).send({ message: 'Dealer updated successfully' });
      } else {
          res.status(404).send({ message: 'Dealer not found' });
      }
  } catch (error) {
      console.error('Error updating dealer:', error);
      res.status(500).send({ message: 'An error occurred while updating the dealer' });
  }
});


// Handle dealer login
app.post('/dealer-login', async (req, res) => {
  console.log('Request Body', req.body); // Debugging: log the received body
  const { email, id_no } = req.body;

  try {
      if (!email || !id_no) {
          return res.status(400).json({ success: false, message: 'Email and ID number are required.' });
      }

      const trimmedEmail = email.trim();
      const trimmedIdNo = id_no.trim();

      const dealer = await Dealer.findOne({
          email: { $regex: new RegExp(`^${trimmedEmail}$`, 'i') },
          id_no: trimmedIdNo
      });

      if (dealer) {
          // Store dealer email and Id in session for later retrieval
          req.session.dealerEmail = dealer.email; // Assuming you are using sessions
          req.session.dealerId = dealer._id;
          
          // Read and modify the dealers.html file
          const dealersPath = path.join(__dirname, 'public', 'dealers.html');
          let dealersHtml = fs.readFileSync(dealersPath, 'utf8');
          dealersHtml = dealersHtml.replace('{{username}}', dealer.username);

          // Send the modified HTML content directly in the response
          res.send(dealersHtml);
      } else {
          return res.send("<script>alert('Invalid email or ID number. Please try again or sign up as a dealer first.'); window.location.href = '/join_us.html';</script>");
      }
  } catch (error) {
      console.error('Error during dealer login:', error);
      res.status(500).send("<script>alert('An error occurred. Please try again.'); window.location.href = '/join_us.html';</script>");
  }
});


// Fetch dealer info by ID
app.get('/dealer-info/:id', async (req, res) => {
  const dealerId = req.params.id;
  try {
      const dealer = await Dealer.findById(dealerId);
      if (dealer) {
          res.json({ success: true, dealer });
      } else {
          res.json({ success: false, message: 'Dealer not found' });
      }
  } catch (error) {
      console.error('Error fetching dealer info by ID:', error);
      res.status(500).json({ success: false, message: 'Error fetching dealer info by ID' });
  }
});

//code to fetch the dealers info in the DB and display them in the account.html
app.get('/dealer-info', async (req, res) => {
  try {
      // Retrieve dealer ID from session or JWT
      const dealerId = req.session.dealerId; // Assuming you stored dealerId in session

      if (!dealerId) {
          return res.status(401).json({ success: false, message: 'Unauthorized access.' });
      }

      const dealer = await Dealer.findById(dealerId);

      if (!dealer) {
          return res.status(404).json({ success: false, message: 'Dealer not found.' });
      }

      // Send dealer data to the frontend to populate account.html
      res.json({
          success: true,
          dealer: {
              _id: dealer._id,
              username: dealer.username,          // dealer's name
              email: dealer.email,                // dealer's email
              phone_number: dealer.phone_number,  // dealer's phone number
              address: dealer.address,            // dealer's address
              id_no: dealer.id_no,                
          },
      });
  } catch (error) {
      console.error('Error fetching dealer data:', error);
      res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
});

//Code for updating the dealers data in the account.html
app.put('/update-dealer-info', async (req, res) => {
  try {
      const dealerId = req.body.dealerId; // Retrieve dealer ID from the request body

      if (!dealerId) {
          return res.status(401).json({ success: false, message: 'Unauthorized access.' });
      }

      // Update the dealer's information in the database
      const updatedDealer = await Dealer.findByIdAndUpdate(dealerId, {
          username: req.body.username,         // dealer's name
          email: req.body.email,               // dealer's email
          phone_number: req.body.phone_number, // dealer's phone number
          address: req.body.address,           // dealer's address
      }, { new: true }); // `new: true` returns the updated document 

      if (!updatedDealer) {
          return res.status(404).json({ success: false, message: 'Dealer not found.' });
      }

      res.json({ success: true, message: 'Details updated successfully.' });
  } catch (error) {
      console.error('Error updating dealer details:', error);
      res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
});

// Fetch dealer details by ID
app.get('/dealer-info/:id', async (req, res) => {
  const dealerId = req.params.id;
  try {
      const dealer = await Dealer.findById(dealerId);
      if (dealer) {
          res.json({ success: true, dealer });
      } else {
          res.json({ success: false, message: 'Dealer not found' });
      }
  } catch (error) {
      console.error('Error fetching dealer info by ID:', error);
      res.status(500).json({ success: false, message: 'Error fetching dealer info by ID' });
  }
});

// Update dealer info
app.post('/update-dealer/:id', async (req, res) => {
  const dealerId = req.params.id;
  const { username, id_no, phone_number, email, address } = req.body;

  try {
      const updatedDealer = await Dealer.findByIdAndUpdate(dealerId, {
          username, id_no, phone_number, email, address
      }, { new: true });

      if (updatedDealer) {
          res.json({ success: true, dealer: updatedDealer });
      } else {
          res.json({ success: false, message: 'Dealer not found' });
      }
  } catch (error) {
      console.error('Error updating dealer info:', error);
      res.status(500).json({ success: false, message: 'Error updating dealer info' });
  }
});

// Delete dealer info
app.delete('/delete-dealer/:id', async (req, res) => {
  const dealerId = req.params.id;
  try {
      const deletedDealer = await Dealer.findByIdAndDelete(dealerId);
      if (deletedDealer) {
          res.json({ success: true, message: 'Dealer deleted successfully' });
      } else {
          res.json({ success: false, message: 'Dealer not found' });
      }
  } catch (error) {
      console.error('Error deleting dealer info:', error);
      res.status(500).json({ success: false, message: 'Error deleting dealer info' });
  }
});


// Message schema and model
const messageSchema = new mongoose.Schema({
  vehicleID: { type: String, required: true },
  vehicleName: { type: String, required: true },
  dealerName: { type: String, required: true },
  userName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Endpoint to save messages
app.post('/api/ClientMesso', async (req, res) => {
  const { vehID, vehicleName, dealerName, userName, phoneNumber, message } = req.body;

  const newMessage = new Message({
      vehicleID: vehID,
      vehicleName: vehicleName,
      dealerName: dealerName,
      userName: userName,
      phoneNumber: phoneNumber,
      message: message
  });

  try {
      await newMessage.save();
      res.status(201).json({ message: 'Message sent successfully!' });
  } catch (error) {
      res.status(500).json({ message: 'Error saving message: ' + error.message });
  }
});

// Handle traditional sign-up
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Validate input fields
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Username, email, and password are required.' });
  }

  try {
    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use.' });
    }

    // Hash the password and create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Send success response
    res.status(201).json({ success: true, message: 'User registered successfully.' });
  } catch (error) {
    // Log and send error response
    console.error('Error during sign-up:', error);
    res.status(500).json({ success: false, message: 'Failed to sign up. Please try again.' });
  }
});

//Route for getting user details by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({message: 'User not found'});
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'An error occurred while fetching user'});
  }
});

//Route to update the user details
app.put('/api/users/:id', async (req, res) => {
  try{
    const userId = req.params.id;
    const updatedUser = req.body;
    const result = await User.findByIdAndUpdate(userId, updatedUser, { new: true });
    if (result) {
      res.status(200).send({ message: 'User updated successfully' });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  } catch (error) {
    console.error('error updating user:', error);
    res.status(500).send({ message: 'An error occurred while updating the user details '});
  }
});

//Route to update the user details from the user dashboard
app.put('/update-user', async (req, res) => {
  try {
      const { id, username, email, password } = req.body;

      // Check for missing ID
      if (!id) {
          console.log("No ID provided in request body");
          return res.status(400).json({ success: false, message: 'User ID is required.' });
      }

      console.log("Updating user with ID:", id);

      const user = await User.findById(id);
      if (!user) {
          console.log("User not found");
          return res.status(404).json({ success: false, message: 'User not found.' });
      }

      // Log incoming values
      console.log("Username:", username);
      console.log("Email:", email);
      console.log("Password provided:", !!password);

      // Update fields
      if (username) user.username = username;
      if (email) user.email = email;
      if (password && password.trim() !== '') {
          const hashedPassword = await bcrypt.hash(password, 10);
          user.password = hashedPassword;
      }

      await user.save();
      console.log("User updated successfully");

      res.json({ success: true, message: 'User updated successfully.' });

  } catch (error) {
      console.error('Error updating user:', error.message);
      res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
});


//Handle delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

//Handle deletion of user account from user accounts2.html
app.delete('/delete-dealer/:id', async (req, res) => {
    const dealerId = req.params.id;
    try {
        await Dealer.deleteOne({ _id: dealerId });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting dealer:', error);
        res.status(500).json({ success: false, message: 'Failed to delete dealer.' });
    }
});

// Handle traditional login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({error: 'Invalid username or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });

    // Set token in a cookie
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });

    // Respond with JSON, not redirect
    res.json({ success: true, username: user.username });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

//code for logging out users when they click logout
app.get('/logout', (req, res) => {
  res.clearCookie('token'); // Clear the JWT cookie (or use your cookie name)
  res.redirect('/'); // Redirect to homepage
});


// Fetching the user-info for dashboard display
app.get('/api/user-info', authenticateToken, async (req, res) => {
  try {
    const user = req.user; // comes from authenticateToken

    res.json({
      username: user.username,
      email: user.email,
      vehicles: [],          // plug in later
      recommendations: []    // plug in later
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user info' });
  }
});

// Fetch all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username email'); // Fetch username and email only
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Code to fetch the dealer's info from the DB and display it in account.html
app.get('/user-info', authenticateToken, async (req, res) => {
  try {
      // Retrieve userId from session
      const userId = req.user; 

      if (!userId) {
          return res.status(401).json({ success: false, message: 'Unauthorized access.' });
      }

      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ success: false, message: 'User not found.' });
      }

      // Send dealer data to the frontend to populate account.html
      res.json({
          success: true,
          dealer: {
              _id: user._id, 
              username: user.username, // Dealer's username
              email: user.email,       // Dealer's email
              password: user.password  // Dealer's password (Consider not sending this for security)
          },
      });
  } catch (error) {
      console.error('Error fetching dealer data:', error);
      res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
});


// Serve the dashboard page
app.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // req.user already fetched by middleware
    const dashboardPath = path.join(__dirname, 'public', 'dashboard.html');
    let dashboardHtml = fs.readFileSync(dashboardPath, 'utf8');

    dashboardHtml = dashboardHtml.replace('{{username}}', req.user.username);

    res.send(dashboardHtml);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});


// New endpoint to check login status
app.get('/check-login-status', authenticateToken, (req, res) => {
  res.json({
    loggedIn: true,
    username: req.user.username
  });
});

//app.post('/api/subscribe', authenticateToken, async (req, res) => {
//    try {
//        const { plan } = req.body;
//
//        const planPrices = {
//            basic: 299,
//            standard: 799,
//            premium: 1499
//        };
//
//        const planDurations = {
//            basic: 7,
//            standard: 30,
//            premium: 60
//        };
//
//        if (!plan || !planDurations[plan]) {
//            return res.status(400).json({
//                success: false,
//                message: 'Invalid or missing subscription plan'
//            });
//        }
//
//        if (!req.user || !req.user._id) {
//            return res.status(401).json({
//                success: false,
//                message: 'Unauthorized'
//            });
//        }
//
//        const userId = req.user._id;
//
//        const existing = await Subscription.findOne({ userId });
//
//        if (existing) {
//            return res.json({
//                success: true,
//                message: 'Already subscribed'
//            });
//        }
//
//        const expiry = new Date();
//        expiry.setDate(expiry.getDate() + planDurations[plan]);
//
//        await Subscription.create({
//            userId,
//            plan,
//            amount: planPrices[plan],
//            expiryDate: expiry
//        });
//
//        res.json({ success: true });
//
//    } catch (error) {
//        console.error("Subscription error:", error);
//        res.status(500).json({ success: false });
//    }
//});
//app.post('/api/mpesa/subscribe', authenticateToken, async (req, res) => {
//    try {
//        const { plan } = req.body;
//        const planPrices = {
//            basic: 299,
//            standard: 799,
//            premium: 1499
//        };
//        const planDurations = {
//            basic: 7,
//            standard: 30,
//            premium: 60
//        };
//        if (!plan || !planDurations[plan]) {
//            return res.status(400).json({
//                success: false,
//                message: 'Invalid or missing subscription plan'
//            });
//        }
//        if (!req.user || !req.user._id) {
//            return res.status(401).json({
//                success: false,
//                message: 'Unauthorized'
//            });
//        }
//        const userId = req.user._id;
//        const existing = await Subscription.findOne({ userId });
//        if (existing) {
//            return res.json({
//                success: true,
//                message: 'Already subscribed'
//            });
//        }
//        const expiry = new Date();
//        expiry.setDate(expiry.getDate() + planDurations[plan]);
//        await Subscription.create({
//            userId,
//            plan,
//            amount: planPrices[plan],
//            expiryDate: expiry
//        });
//
//        res.json({ success: true });
//    } catch (error) {
//        console.error("Subscription error:", error);
//        res.status(500).json({ success: false });
//    }
//});

app.post('/api/mpesa/subscribe', authenticateToken, uploadDealer.array('dealer_vehicle_image', 10), async (req, res) => {
  try {
    const { plan, phone } = req.body;
    const userId = req.user._id;

    const planPrices = {
      basic: 10,
      standard: 20,
      premium: 30
    };

    const amount = planPrices[plan];
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription plan'
      });
    }

    // Build callback URL
    let callbackUrl = process.env.CALLBACK_URL;
    
    if (!callbackUrl) {
      // If CALLBACK_URL not set, construct from BASE_URL or current host
      let baseUrl =
        process.env.BASE_URL ||
        `${req.protocol}://${req.get('host')}`;
      
      baseUrl = baseUrl.replace(/\/$/, '');
      callbackUrl = `${baseUrl}/api/mpesa/callback`;
    }
    
    console.log('Using callback URL:', callbackUrl);

    // quick sanity check that our callback URL is reachable from this server
    try {
      await axios.get(callbackUrl, { timeout: 5000 });
      console.log('callback URL reachable');
    } catch (err) {
      console.warn('Callback URL not reachable locally:', err.message);
      // it may still be reachable from Safaricom; continue anyway
    }

    // Initiate STK Push
    const stkResponse = await initiateSTKPush({
      phone,
      amount,
      accountRef: `SUB-${userId}-${plan}`,
      callbackUrl
    });

    // ✅ CORRECT Axios access
    const checkoutRequestID = stkResponse?.data?.CheckoutRequestID;

    if (!checkoutRequestID) {
      console.error('STK response missing CheckoutRequestID:', stkResponse.data);
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate payment'
      });
    }

    // Get image paths if files were uploaded
    const imagePaths = req.files ? req.files.map(file => 'uploads/dealer_uploads/' + file.filename) : [];

    // Save pending subscription WITH vehicle data (create new document to avoid accidental overwrites)
    try {
      const existing = await PendingSubscription.findOne({ checkoutRequestID });
      if (existing) {
        console.warn('Pending subscription already exists for:', checkoutRequestID);
      } else {
        const pending = new PendingSubscription({
          userId,
          plan,
          amount,
          phone,
          checkoutRequestID,
          status: 'pending',
          vehicleData: {
            vehicle_make: req.body.vehicle_make,
            vehicle_model: req.body.vehicle_model,
            vehicle_price: req.body.vehicle_price,
            dealer_name: req.body.dealer_name,
            dealer_id: req.body.dealer_id,
            status: req.body.status,
            color: req.body.color,
            Interior: req.body.Interior,
            kilometers: req.body.kilometers,
            transmission: req.body.transmission,
            phone_number: req.body.phone_number || req.user?.phone_number,
            dealer_email: req.body.dealer_email || req.user?.email,
            vehicle_year: req.body.vehicle_year,
            type_of_fuel: req.body.type_of_fuel,
            engine_capacity: req.body.engine_capacity,
            vehicle_description: req.body.vehicle_description,
            vehicle_images: imagePaths,
            dealerId: userId
          },
          createdAt: new Date()
        });

        await pending.save();
        console.log('Pending subscription created with vehicle data:', checkoutRequestID);
      }
    } catch (saveErr) {
      console.error('Error saving pending subscription:', saveErr);
    }

    res.json({
      success: true,
      message: 'STK push sent. Complete payment on your phone.'
    });

  } catch (error) {
    console.error('STK PUSH ERROR:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Payment initiation failed'
    });
  }
});

// manual payment route: users enter mpesa code themselves
app.post('/api/mpesa/manual', authenticateToken, uploadDealer.array('dealer_vehicle_image', 10), async (req, res) => {
    try {
        const { plan, phone, mpesaCode } = req.body;
        const userId = req.user._id;

        const planPrices = {
            basic: 10,
            standard: 20,
            premium: 30
        };

        const amount = planPrices[plan];
        if (!amount) {
            return res.status(400).json({ success: false, message: 'Invalid subscription plan' });
        }

        if (!mpesaCode) {
            return res.status(400).json({ success: false, message: 'Mpesa code required' });
        }

        const imagePaths = req.files ? req.files.map(file => 'uploads/dealer_uploads/' + file.filename) : [];

        // Prevent accidental overwrites: if a pending with same mpesaCode exists, reject
        const existing = await PendingSubscription.findOne({ checkoutRequestID: mpesaCode });
        if (existing) {
          console.warn('Manual pending subscription already exists for code:', mpesaCode);
          return res.status(409).json({ success: false, message: 'This M-Pesa code has already been submitted' });
        }

        const pending = new PendingSubscription({
          userId,
          plan,
          amount,
          phone,
          checkoutRequestID: mpesaCode,
          status: 'pending',
          vehicleData: {
            vehicle_make: req.body.vehicle_make,
            vehicle_model: req.body.vehicle_model,
            vehicle_price: req.body.vehicle_price,
            dealer_name: req.body.dealer_name,
            dealer_id: req.body.dealer_id,
            status: req.body.status,
            color: req.body.color,
            Interior: req.body.Interior,
            kilometers: req.body.kilometers,
            transmission: req.body.transmission,
            phone_number: req.body.phone_number || req.user?.phone_number,
            dealer_email: req.body.dealer_email || req.user?.email,
            vehicle_year: req.body.vehicle_year,
            type_of_fuel: req.body.type_of_fuel,
            engine_capacity: req.body.engine_capacity,
            vehicle_description: req.body.vehicle_description,
            vehicle_images: imagePaths,
            dealerId: userId
          },
          createdAt: new Date()
        });

        await pending.save();
        console.log('Manual pending subscription created:', mpesaCode);
        res.json({ success: true, message: 'Manual subscription recorded, awaiting admin approval.' });
    } catch (error) {
        console.error('Manual subscription error:', error);
        res.status(500).json({ success: false, message: 'Failed to record manual subscription' });
    }
});

// Dealer subscription STK initiation (from dealers.html)
app.post('/api/mpesa/dealer-subscribe', async (req, res) => {
  try {
    const { plan, phone } = req.body;

    // dealerId should be in session (set when dealer logged in)
    const dealerId = req.session && req.session.dealerId;
    if (!dealerId) return res.status(401).json({ success: false, message: 'Dealer not authenticated' });

    const planPrices = {
      basic: 10,
      standard: 20,
      premium: 30
    };

    const amount = planPrices[plan];
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan' });
    }

    // Build callback URL
    let callbackUrl = process.env.CALLBACK_URL;
    if (!callbackUrl) {
      let baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      baseUrl = baseUrl.replace(/\/$/, '');
      callbackUrl = `${baseUrl}/api/mpesa/callback`;
    }

    const stkResponse = await initiateSTKPush({
      phone,
      amount,
      accountRef: `DEALER-${dealerId}-${plan}`,
      callbackUrl
    });

    const checkoutRequestID = stkResponse?.data?.CheckoutRequestID;
    if (!checkoutRequestID) {
      console.error('STK response missing CheckoutRequestID:', stkResponse?.data);
      return res.status(500).json({ success: false, message: 'Failed to initiate payment' });
    }

    // Save pending subscription (mark as dealer) - create new document to avoid overwrite
    try {
      const existingDealerPending = await PendingSubscription.findOne({ checkoutRequestID });
      if (existingDealerPending) {
        console.warn('Pending subscription already exists for dealer code:', checkoutRequestID);
      } else {
        const pendingDealer = new PendingSubscription({
          userId: dealerId,
          plan,
          amount,
          phone,
          checkoutRequestID,
          status: 'pending',
          isDealer: true,
          createdAt: new Date()
        });
        await pendingDealer.save();
      }
    } catch (err) {
      console.error('Error saving dealer pending subscription:', err);
    }

    res.json({ success: true, message: 'STK push sent. Complete payment on your phone.' });
  } catch (error) {
    console.error('Dealer STK PUSH ERROR:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Payment initiation failed' });
  }
});

app.post('/api/mpesa/callback', async (req, res) => {
  try {
    const stkCallback = req.body?.Body?.stkCallback;

    if (!stkCallback) {
      console.error('Invalid STK callback payload:', req.body);
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const { ResultCode, CheckoutRequestID, CallbackMetadata } = stkCallback;

    if (ResultCode !== 0) {
      console.warn('STK payment failed:', CheckoutRequestID, stkCallback.ResultDesc);
      await PendingSubscription.findOneAndDelete({ checkoutRequestID: CheckoutRequestID });
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    console.log('Payment successful for CheckoutRequestID:', CheckoutRequestID);
    const pending = await PendingSubscription.findOne({ checkoutRequestID: CheckoutRequestID });
    
    if (!pending) {
      console.warn('No pending subscription for:', CheckoutRequestID);
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    console.log('Found pending subscription for user:', pending.userId);

    // Safely extract amount
    const paidAmount = CallbackMetadata?.Item?.find(i => i.Name === 'Amount')?.Value || pending.amount;

    // Activate subscription
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + 30);

    const subscription = await Subscription.findOneAndUpdate(
      { userId: pending.userId },
      {
        plan: pending.plan,
        amount: paidAmount,
        status: 'active',
        startDate,
        expiryDate
      },
      { upsert: true, new: true }
    );

    console.log('Subscription activated:', subscription._id);

    // If this pending was a dealer subscription, also create/update DealerSubscription
    if (pending.isDealer) {
      try {
        await DealerSubscription.findOneAndUpdate(
          { dealerId: pending.userId },
          {
            plan: pending.plan,
            amount: paidAmount,
            status: 'active',
            startDate,
            expiryDate,
            username: pending.username || undefined,
            email: pending.email || undefined,
            phone_number: pending.phone || undefined
          },
          { upsert: true, new: true }
        );
        console.log('DealerSubscription created/updated for dealer:', pending.userId);
      } catch (dsErr) {
        console.error('Error creating DealerSubscription:', dsErr);
      }
    }

    // ✅ POST VEHICLE IF DATA EXISTS
    if (pending.vehicleData) {
      try {
        const vehicleData = pending.vehicleData;
        const vehicle = new Vehicle({
          ...vehicleData,
          dealerId: pending.userId
        });
        await vehicle.save();
        console.log('Vehicle posted successfully:', vehicle._id);
      } catch (vehicleError) {
        console.error('Error posting vehicle after payment:', vehicleError);
        // Don't fail the subscription just because vehicle posting failed
      }
    }

    // Delete pending
    await PendingSubscription.deleteOne({ checkoutRequestID: CheckoutRequestID });
    console.log('Pending subscription deleted:', CheckoutRequestID);

    // ✅ ACK Safaricom
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

  } catch (error) {
    console.error('CALLBACK ERROR:', error);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
});


app.get('/api/check-subscription', authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        console.log('Checking subscription for user:', userId);
        
        const subscription = await Subscription.findOne({
            userId: userId,
            status: 'active',
            expiryDate: { $gt: new Date() }
        });

        console.log('Subscription found:', !!subscription);
        res.json({ subscribed: !!subscription });
    } catch (err) {
        console.error('Check subscription error:', err);
        res.status(500).json({ subscribed: false, error: err.message });
    }
});

// Check dealer subscription endpoint
app.get('/api/check-dealer-subscription', async (req, res) => {
    try {
        const dealerId = req.session.dealerId;
        console.log('Checking subscription for dealer:', dealerId);
        
        if (!dealerId) {
            return res.json({ subscribed: false });
        }
        
        // Check both DealerSubscription and Subscription models
        const dealerSub = await DealerSubscription.findOne({
            dealerId: dealerId,
            status: 'active',
            expiryDate: { $gt: new Date() }
        });

        const userSub = await Subscription.findOne({
            userId: dealerId,
            status: 'active',
            expiryDate: { $gt: new Date() }
        });

        const subscribed = !!(dealerSub || userSub);
        console.log('Dealer subscription found:', subscribed);
        res.json({ subscribed });
    } catch (err) {
        console.error('Check dealer subscription error:', err);
        res.status(500).json({ subscribed: false, error: err.message });
    }
});

// Admin endpoints for pending subscription approvals
app.get('/api/pending-subscriptions', async (req, res) => {
    try {
        const list = await PendingSubscription.find()
            .populate('userId', 'username phone_number');
        res.json(list);
    } catch (err) {
        console.error('Error fetching pending subscriptions:', err);
        res.status(500).json({ error: 'Failed to load pending subscriptions' });
    }
});

app.post('/api/pending-subscriptions/:id/approve', async (req, res) => {
    try {
        const pending = await PendingSubscription.findById(req.params.id).populate('userId', 'username email phone_number');
        if (!pending) return res.status(404).json({ success: false, message: 'Not found' });

        const startDate = new Date();
        const expiryDate = new Date(startDate);
        expiryDate.setDate(expiryDate.getDate() + 30);

        await Subscription.findOneAndUpdate(
            { userId: pending.userId._id },
            {
                plan: pending.plan,
                amount: pending.amount,
                status: 'active',
                startDate,
                expiryDate
            },
            { upsert: true, new: true }
        );

        if (pending.isDealer) {
            await DealerSubscription.findOneAndUpdate(
                { dealerId: pending.userId._id },
                {
                    plan: pending.plan,
                    amount: pending.amount,
                    status: 'active',
                    startDate,
                    expiryDate,
                    username: pending.userId.username,
                    email: pending.userId.email,
                    phone_number: pending.phone
                },
                { upsert: true, new: true }
            );
        }

        // if the pending request contained vehicleData, create the vehicle now
        if (pending.vehicleData) {
            try {
                const vehicle = new Vehicle({
                    ...pending.vehicleData,
                    dealerId: pending.userId._id
                });
                await vehicle.save();
                console.log('Vehicle posted on approval:', vehicle._id);
            } catch (vehErr) {
                console.error('Error posting vehicle on approval:', vehErr);
                // continue anyway
            }
        }

        await PendingSubscription.deleteOne({ _id: pending._id });
        res.json({ success: true });
    } catch (err) {
        console.error('Approval error:', err);
        res.status(500).json({ success: false });
    }
});

app.post('/api/pending-subscriptions/:id/deny', async (req, res) => {
    try {
        await PendingSubscription.deleteOne({ _id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        console.error('Deny error:', err);
        res.status(500).json({ success: false });
    }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
