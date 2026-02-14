import express from "express";
import Thread from "../models/Thread.js";
import getCongnixAPIResponse from "../utils/cognix.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

//test
// router.post("/test", async (req, res) => {
//   try {
//     const thread = new Thread({
//       threadId: "2007",
//       title: "Computer Science",
//     });
//     const response = await thread.save();
//     res.send(response);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json(err, "Failed to save Data");
//   }
// });

//Get all threads
router.get("/thread", authMiddleware, async (req, res) => {
  const threads = await Thread.find({
    userId: req.user.id,
  }).sort({ updatedAt: -1 });

  res.json(threads);
});

//Get thread with Id
router.get("/thread/:threadId", authMiddleware, async (req, res) => {
  try {
    const thread = await Thread.findOne({
      _id: req.params.threadId,
      userId: req.user.id,
    });
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }
    res.json(thread.messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

//Delete Thread
router.delete("/thread/:threadId", authMiddleware, async (req, res) => {
  try {
    const deleted = await Thread.findOneAndDelete({
      _id: req.params.threadId,
      userId: req.user.id, // ensure user owns thread
    });

    if (!deleted) {
      return res.status(404).json({ error: "No result found" });
    }

    res.json({ success: "Thread deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete thread" });
  }
});

//Chat route
router.post("/chat", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { threadId, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    let thread = null;

    if (threadId) {
      thread = await Thread.findOne({ _id: threadId, userId });
    }

    if (!thread) {
      thread = new Thread({
        userId,
        title: message,
        messages: [{ role: "user", content: message }],
      });
    } else {
      thread.messages.push({
        role: "user",
        content: message,
      });
    }

    const assistantReply = await getCongnixAPIResponse(message);

    thread.messages.push({
      role: "assistant",
      content: assistantReply,
    });

    thread.updatedAt = new Date();
    await thread.save();

    res.status(200).json({
      reply: assistantReply,
      threadId: thread._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
