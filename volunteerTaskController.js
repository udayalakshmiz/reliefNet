import VolunteerTask from '../models/volunteerTaskModel.js';
import User from '../models/userModel.js';
import HelpRequest from '../models/requestModel.js';
import express from 'express';

// Assign a task to a volunteer (Admin/NGO only)
export const assignTask = async (req, res) => {
  try {
    console.log("Assigning task. Authenticated user:", req.user);
    console.log("Received body:", req.body);

    const { volunteerId, requestId, taskType, location, urgency, notes } = req.body;

    const task = new VolunteerTask({
      volunteerId,
      requestId,
      assignedBy: req.user.id,
      taskType,
      location,
      urgency,
      notes,
      status: 'Pending',
      assignedAt: new Date()
    });

    await task.save();
    console.log("Task saved:", task);

    // Optional: Update HelpRequest status to "Assigned"
    await HelpRequest.findByIdAndUpdate(requestId, { status: 'Assigned' });

    // Optional: Send email to the volunteer
    const volunteer = await User.findById(volunteerId);
    if (!volunteer) {
      console.error("Volunteer not found for ID:", volunteerId);
      return res.status(404).json({ message: "Volunteer not found" });
    }
    const fullRequest = await HelpRequest.findById(requestId);
    console.log("EMAIL REQUEST DATA:", fullRequest);
    if (volunteer) {
      await sendTaskAssignmentNotification(volunteer.email, volunteer.name, fullRequest);
    }

    res.status(201).json({ message: 'Task assigned successfully', task });
  } catch (error) {
    console.error('Assign Task Error:', error);
    res.status(500).json({ message: 'Failed to assign task' });
  }
};

// controllers/taskController.js (completeTask function)
export const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await VolunteerTask.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.status = 'Completed';
    await task.save();

    // 🔄 Update request status
    await HelpRequest.findByIdAndUpdate(task.requestId, { status: 'Completed' });

    res.status(200).json({ message: 'Task marked as completed' });
  } catch (err) {
    console.error('Error completing task:', err);
    res.status(500).json({ message: 'Failed to complete task' });
  }
};

// Get tasks assigned to a volunteer
export const getMyTasks = async (req, res) => {
  try {
    const volunteerId = req.user?.id;

    if (!volunteerId) {
      return res.status(400).json({ error: 'User not authenticated' });
    }

    const tasks = await VolunteerTask.find({ volunteerId });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

