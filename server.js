console.log("Starting server.js...");

const express = require('express');
const mongoose = require('mongoose');
const Student = require('./models/student');
const Doctor = require('./models/doctor');
require('dotenv').config(); // Load .env if present

const app = express();
app.use(express.json());

const LOCAL_URI = "mongodb://127.0.0.1:27017/clinic";
const ATLAS_URI = process.env.MONGO_URI; // Add your Atlas URI to .env

async function startServer() {
  try {
    const connectionUri = ATLAS_URI || LOCAL_URI;
    await mongoose.connect(connectionUri); // Removed deprecated options

    console.log(` Connected to MongoDB: ${ATLAS_URI ? "Atlas" : "Local (Compass)"}`);

    // ROUTES

    // Add a hardcoded student
    app.post('/add-hardcoded-student', async (req, res) => {
      const student = new Student({ name: "Ali", age: 20, level: "3", address: "Cairo" });
      await student.save();
      res.send('Hardcoded student added');
    });

    // Add a student from request body
    app.post('/add-student', async (req, res) => {
      const student = new Student(req.body);
      await student.save();
      res.send('Student added from body');
    });

    // Add a doctor from query parameters
    app.post('/add-doctor', async (req, res) => {
      const doctor = new Doctor({
        name: req.query.name,
        age: req.query.age,
        phone: req.query.phone,
      });
      await doctor.save();
      res.send('Doctor added from query');
    });

    // Fetch all students
    app.get('/students', async (req, res) => {
      const students = await Student.find();
      res.json(students);
    });

    // Delete a student by ID
    app.delete('/student/:id', async (req, res) => {
      await Student.findByIdAndDelete(req.params.id);
      res.send('Student deleted');
    });

    // Update a doctor's name
    app.put('/doctor/update-name', async (req, res) => {
      const { oldName, newName } = req.query;
      const doctor = await Doctor.findOneAndUpdate({ name: oldName }, { name: newName });
      if (doctor) res.send('Doctor name updated');
      else res.send('Doctor not found');
    });

    // Fetch all students and doctors
    app.get('/all', async (req, res) => {
      const students = await Student.find();
      const doctors = await Doctor.find();
      res.json({ students, doctors });
    });

    // Start server
    app.listen(3000, () => {
      console.log(" Server is running on port 3000");
    });

  } catch (err) {
    console.error(' DB connection error:', err);
  }
}

startServer();
