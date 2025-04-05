import User from "../models/userModel.js";
import Book from "../models/bookModel.js";
import jwt from "jsonwebtoken";

// Add a book to the wishlist
export const addToWishlist = async (req, res) => {
  const { bookId } = req.body; // Get the book ID from the request body
  const userId = req.user; // Assuming you have user ID from the token

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the book is already in the wishlist
    if (user.wishlist.includes(bookId)) {
      user.wishlist = user.wishlist.filter((book) => book._id != bookId);
    } else {
      user.wishlist.push(bookId); // Add the book ID to the wishlist
    }

    await user.save(); // Save the updated user document

    res.status(200).json({
      success: true,
      message: "Book added to wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get the user's wishlist
export const getWishlist = async (req, res) => {
  const userId = req.user; // Assuming you have user ID from the token

  try {
    const user = await User.findById(userId).populate("wishlist"); // Populate the wishlist with book details
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user profile based on token
export const getUserProfile = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get the token from the Authorization header

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Extract user ID from the token

    // Find the user by ID
    const user = await User.findById(userId).select("-password"); // Exclude password from the response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, user }); // Return the user profile
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};
