import Router from "express";
import * as db from "../services/tag-service.js";

const tagRouter = Router();

// get all tags
tagRouter.get("/", async (req, res) => {
  try {
    const tags = await db.getAllTags();
    res.json(tags);
  } catch (e) {
    console.log(e);
    res.status(500).send("Could not get tags");
  }
});

// create new tag
tagRouter.post("/", async (req, res) => {
  try {
    const tagId = await db.createTag(req.body);
    res.json(tagId);
  } catch (e) {
    console.log(e);
    res.status(500).send("Could not create tag");
  }
});

export { tagRouter };
