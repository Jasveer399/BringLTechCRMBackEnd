import {Announcement} from "../model/announcement.model.js";
import { Employee } from "../model/employee.model.js";

// Create a new announcement
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, priority, expiryDate } = req.body;
    const sender = req.user._id;

    console.log("Announcement Body :=",req.body)

    const newAnnouncement = new Announcement({
      title,
      content,
      sender,
      category,
      priority,
      expiryDate,
    });

    await newAnnouncement.save();

    // Notify employees (assuming you have a notification system set up)
    const io = req.app.get("io");
    io.emit("newAnnouncement", newAnnouncement);

    res.status(201).json({
      success: true,
      data: newAnnouncement,
      message: "Announcement created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all announcements
const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort("-createdAt")
      .populate("sender", "name email");

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get a single announcement
const getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate(
      "sender",
      "name email"
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update an announcement
const updateAnnouncement = async (req, res) => {
  try {
    const { title, content, category, priority, expiryDate, isActive } =
      req.body;

    let announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    announcement.title = title || announcement.title;
    announcement.content = content || announcement.content;
    announcement.category = category || announcement.category;
    announcement.priority = priority || announcement.priority;
    announcement.expiryDate = expiryDate || announcement.expiryDate;
    announcement.isActive =
      isActive !== undefined ? isActive : announcement.isActive;
    announcement.updatedAt = Date.now();

    await announcement.save();

    res.status(200).json({
      success: true,
      data: announcement,
      message: "Announcement updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete an announcement
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    await announcement.remove();

    res.status(200).json({
      success: true,
      data: {},
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get filtered announcements
const getFilteredAnnouncements = async (req, res) => {
  try {
    const { category, priority, startDate, endDate, isActive } = req.query;

    let query = {};

    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (isActive !== undefined) query.isActive = isActive === "true";

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const announcements = await Announcement.find(query)
      .sort("-createdAt")
      .populate("sender", "name email");

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Send announcement to specific employees
const sendAnnouncementToEmployees = async (req, res) => {
  try {
    const { announcementId, employeeIds } = req.body;

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    const employees = await Employee.find({ _id: { $in: employeeIds } });

    // Notify specific employees (assuming you have a notification system set up)
    const io = req.app.get("io");
    employees.forEach((employee) => {
      io.to(employee._id.toString()).emit("newAnnouncement", announcement);
    });

    res.status(200).json({
      success: true,
      message: "Announcement sent to specified employees",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get announcements statistics
const getAnnouncementStats = async (req, res) => {
  try {
    const stats = await Announcement.aggregate([
      {
        $group: {
          _id: null,
          totalAnnouncements: { $sum: 1 },
          activeAnnouncements: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          categoryCounts: {
            $push: {
              k: "$category",
              v: 1,
            },
          },
          priorityCounts: {
            $push: {
              k: "$priority",
              v: 1,
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalAnnouncements: 1,
          activeAnnouncements: 1,
          categoryBreakdown: { $arrayToObject: "$categoryCounts" },
          priorityBreakdown: { $arrayToObject: "$priorityCounts" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncement,
  getAnnouncementStats,
  getFilteredAnnouncements,
  sendAnnouncementToEmployees,
  deleteAnnouncement,
  updateAnnouncement,
};
