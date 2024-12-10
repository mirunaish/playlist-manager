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

// edit a tag
tagRouter.patch("/", async (req, res) => {
  try {
    const { id, ...tagData } = req.body;
    const tag = await db.editTag(id, tagData);
    res.status(200).json(tag);
  } catch (e) {
    console.log(e);
    res.status(500).send("Could not edit tag");
  }
});

tagRouter.delete("/", async (req, res) => {
  try {
    const { id } = req.body;
    await db.deleteTag(id);
    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.status(500).send("Could not delete tag");
  }
});

export { tagRouter };
