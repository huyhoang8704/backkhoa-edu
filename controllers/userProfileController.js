const UserProfile = require('../models/UserProfile');
const User = require('../models/User');
const slugify = require("slugify");
const s3 = require("../config/space");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

const BUCKET_NAME = "qldapm";
const CDN_URL = "https://qldapm.sgp1.digitaloceanspaces.com";


const getMyProfile = async (req, res) => {
  try {
    const profile = await UserProfile
      .findOne({ user: req.user.id })
      .populate('user', 'name email role');

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = [
      "firstName",
      "lastName",
      "gender",
      "dob",
      "phone",
      "bio",
      "address",
      "academicTitle",
      "expertise",
    ];

    const updateData = {};

    allowedFields.forEach((key) => {
      if (req.body[key] !== undefined && req.body[key] !== null) {
        updateData[key] = req.body[key];
      }
    });

    // 📌 Nếu user upload avatar
    if (req.file) {
      const file = req.file;

      const extension = file.originalname.split(".").pop();
      const safeName = `${Date.now()}-${slugify(req.user.name || req.user.email || "user")}.${extension}`;

      const filePath = `avatars/${req.user.id}/${safeName}`;

      const params = {
        Bucket: BUCKET_NAME,
        Key: filePath,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      };

      // Upload lên DigitalOcean Spaces
      await s3.send(new PutObjectCommand(params));

      // Tạo public URL
      const publicUrl = `${CDN_URL}/${filePath}`;

      updateData.avatarUrl = publicUrl;
    }

    const profile = await UserProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};


const getAllProfiles = async (req, res) => {
  try {
    const profiles = await UserProfile
      .find()
      .populate('user', 'name email role');

    res.status(200).json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getProfileById = async (req, res) => {
  try {
    const profile = await UserProfile
      .findById(req.params.id)
      .populate('user', 'name email role');

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const deleteProfile = async (req, res) => {
  try {
    await UserProfile.findByIdAndDelete(req.params.id);
    res.json({ message: 'Profile deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getAllProfiles,
  getProfileById,
  deleteProfile,
};
