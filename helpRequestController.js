import express from "express";
import HelpRequest from "../models/requestModel.js";
import User from "../models/userModel.js";
import auth from "../middleware/auth.js";

export const createRequest = async (req, res) => {

  try {      
    const { type, urgency, description, location } = req.body;

    const newRequest = new HelpRequest({
      typeOfHelp: type,
      urgencyLevel: urgency,
      description,
      location,
      createdBy: req.user?.id || null
    });

    await newRequest.save();

    res.status(200).json({ message: "Help request created successfully" });
  }  catch (error) {
  console.error("Create Request Error:", error); // full error with stack
  res.status(400).json({ error: error.message || "Failed to submit the help request." });
  }
};


export const getAllHelpRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(400).json({ error: "Failed to retrieve requests." });
  }
};

export const getHelpRequestById = async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving request' });
  }
};

export const updateHelpRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await HelpRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};

export const assignVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.body;
    const requestId = req.params.id;

    // Find the request
    const request = await HelpRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Update the request
    request.assignedVolunteer = volunteerId;
    request.status = 'assigned';
    await request.save();

    res.status(200).json({ message: 'Volunteer assigned successfully' });
  } catch (error) {
    console.error('Assign Error:', error);
    res.status(500).json({ error: 'Failed to assign volunteer' });
  }
};
