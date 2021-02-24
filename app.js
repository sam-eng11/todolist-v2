//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

//connect to mongo
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//create items schema
const itemsSchema = {
  name: String
};

//create new model with capital
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Bake"
});

const item2 = new Item({
  name: "Cook"
});

const item3 = new Item({
  name: "Clean"
});

const defaultItems = [item1, item2, item3];

//Create new Schema
const listSchema = {
  name: String,
  items: [itemsSchema]
};

//Create new model
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  //find all
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully inserted default items");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    };
  });

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });
  item.save();
  res.redirect("/");
});

app.post("/delete", function(req, res) {
  const checkedItemID = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemID, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully removed");
      res.redirect("/");
    }
  });
});

app.get("/:customListName", function(req, res) {
  const customListName = req.params.customListName;

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
      } else {
        //Show an existing list

        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        })
      }
    }
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
