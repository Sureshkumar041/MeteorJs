import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { LinksCollection } from "./links.js";

Meteor.methods({
  async "links.insert"(val) {
    try {
      check(val, Object);
      return await LinksCollection.insertAsync({
        ...val,
        createdAt: new Date(),
      });
    } catch (error) {
      console.log("INSERT: ", error?.message);
      return error?.message;
    }
  },
  async "links.findAll"() {
    try {
      return LinksCollection.find().fetch();
    } catch (error) {
      console.log("findAll: ", error?.message);
      return error?.message;
    }
  },
  async "links.remove"(delId) {
    try {
      return await LinksCollection.removeAsync({ _id: delId });
    } catch (error) {
      console.log("remove: ", error?.message);
      return error?.message;
    }
  },
});
