import { Meteor } from "meteor/meteor";
import { UsersCollection } from "/imports/api/user/user.js";
import { LinksCollection } from "/imports/api/links";
import { WebApp } from "meteor/webapp";
import "../imports/api/linkMethods";
import "../imports/api/linkPublications";
import "../imports/api/links";
import dotenv from "dotenv";

dotenv.config();

async function insertUser({ title, url }) {
  await UsersCollection.insertAsync({ title, url, createdAt: new Date() });
}

async function insertLink({ title, url }) {
  await LinksCollection.insertAsync({ title, url, createdAt: new Date() });
}

Meteor.startup(async () => {
  // If the Links collection is empty, add some data.
  if ((await UsersCollection.find().countAsync()) === 0) {
    await insertUser({
      title: "Do the Tutorialsss",
      url: "https://www.meteor.com/tutorials/react/creating-an-app",
    });

    await insertLink({
      title: "Follow the Guides",
      url: "https://guide.meteor.com",
    });
  }

  // We publish the entire Links collection to all clients.
  // In order to be fetched in real-time to the clients
  Meteor.publish("users", function () {
    return UsersCollection.find();
  });
});

WebApp.connectHandlers.use("/api/links", async (req, res, next) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // Adjust '*' to specific origin if needed
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  try {
    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString(); // Convert Buffer to string
      });
      req.on("end", async () => {
        const val = JSON.parse(body);
        const linksId = await Meteor.call("links.insert", val);
        res.writeHead(201);
        res.end(JSON.stringify({ linksId, msg: "Insert successfully" }));
      });
    } else if (req.method === "GET") {
      const linksList = await Meteor.call("links.findAll");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ data: linksList, msg: "Fetch successfully" }));
    } else if (req.method === "DELETE") {
      const urlParts = req?.url?.split("/"); // Assuming URL format is /api/links/:id
      const delId = urlParts?.[1]; // Extract link ID from the URL (adjust index if necessary)
      console.log("delId: ", delId, urlParts);
      const linksList = await Meteor.call("links.remove", delId);
      console.log("linksList: ", linksList);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ msg: "Delete successfully" }));
    } else {
      res.writeHead(405);
      res.end();
    }
  } catch (error) {
    console.log("Err Links: ", error);
  }
});
