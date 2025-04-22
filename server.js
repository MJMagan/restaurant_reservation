// Import required modules
const express = require('express'); // Express framework for building the server
const bodyParser = require('body-parser'); // Middleware for parsing request bodies
const cors = require('cors'); // Middleware for enabling Cross-Origin Resource Sharing

// Initialize Express application
const app = express();
const PORT = 3000; // Port number the server will listen on

// Apply middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON request bodies

// In-memory data storage for tables and reservations
// This acts as our temporary database (would be replaced with a real database in production)
let tables = [
    { id: 1, seats: 4, available: true }, // Table with ID 1, 4 seats, currently available
    { id: 2, seats: 4, available: true },
    { id: 3, seats: 6, available: true },
    { id: 4, seats: 6, available: true },
    { id: 5, seats: 8, available: true }
];

let reservations = []; // Array to store all reservations

/**
 * Middleware for validating reservation requests
 * Checks if required fields are present and guest count is valid
 */
const validateReservation = (req, res, next) => {
    const { customerName, guestCount, time } = req.body;
    
    // Check if all required fields are present
    if (!customerName || !guestCount || !time) {
        return res.status(400).json({ error: "Name, guest count, and time are required" });
    }
    
    // Check if guest count exceeds maximum allowed
    if (guestCount > 8) {
        return res.status(400).json({ error: "Maximum 8 guests per reservation" });
    }
    
    next(); // Proceed to the next middleware/route handler if validation passes
};

// ========== API ROUTES ========== //

/**
 * GET /tables
 * Returns a list of all tables with their availability status
 */
app.get('/tables', (req, res) => {
    res.json(tables); // Send tables array as JSON response
});

/**
 * GET /reservations
 * Returns a list of all current reservations
 */
app.get('/reservations', (req, res) => {
    res.json(reservations); // Send reservations array as JSON response
});

/**
 * POST /reserve
 * Creates a new reservation
 * Uses validateReservation middleware to check input
 */
app.post('/reserve', validateReservation, (req, res) => {
    const { customerName, guestCount, time } = req.body;
    
    // Find the first available table that can accommodate the guest count
    const availableTable = tables.find(table => 
        table.available && table.seats >= guestCount
    );
    
    // If no suitable table is available, return error
    if (!availableTable) {
        return res.status(400).json({ 
            error: `No available tables for ${guestCount} guests` 
        });
    }
    
    // Create new reservation object
    const reservation = {
        id: reservations.length + 1, // Auto-increment ID
        tableId: availableTable.id, // Reference to the table
        customerName,
        guestCount,
        time,
        status: 'confirmed' // Default status
    };
    
    // Update the table's availability
    availableTable.available = false;
    // Add the new reservation to our array
    reservations.push(reservation);
    
    // Return success message with reservation details
    res.json({ 
        success: `Table ${availableTable.id} reserved for ${customerName} (${guestCount} guests)` 
    });
});

/**
 * PUT /update/:id
 * Updates an existing reservation
 * Uses validateReservation middleware to check input
 */
app.put('/update/:id', validateReservation, (req, res) => {
    const id = parseInt(req.params.id); // Get ID from URL parameter
    const { customerName, guestCount, time } = req.body;
    
    // Find the index of the reservation to update
    const reservationIndex = reservations.findIndex(r => r.id === id);
    
    // If reservation not found, return error
    if (reservationIndex === -1) {
        return res.status(404).json({ error: "Reservation not found" });
    }
    
    // Update the reservation with new values while preserving other properties
    reservations[reservationIndex] = {
        ...reservations[reservationIndex], // Spread existing properties
        customerName, // Update name
        guestCount, // Update guest count
        time // Update time
    };
    
    // Return success message
    res.json({ success: "Reservation updated successfully" });
});

/**
 * DELETE /cancel/:id
 * Cancels an existing reservation and frees up the table
 */
app.delete('/cancel/:id', (req, res) => {
    const id = parseInt(req.params.id); // Get ID from URL parameter
    
    // Find the index of the reservation to cancel
    const reservationIndex = reservations.findIndex(r => r.id === id);
    
    // If reservation not found, return error
    if (reservationIndex === -1) {
        return res.status(404).json({ error: "Reservation not found" });
    }
    
    // Get the table ID from the reservation to free it up
    const tableId = reservations[reservationIndex].tableId;
    // Find the table in our tables array
    const tableIndex = tables.findIndex(t => t.id === tableId);
    
    // If table exists, mark it as available again
    if (tableIndex !== -1) {
        tables[tableIndex].available = true;
    }
    
    // Remove the reservation from our array
    reservations.splice(reservationIndex, 1);
    
    // Return success message
    res.json({ success: "Reservation cancelled successfully" });
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});