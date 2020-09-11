const Item = require("../models/property");
const User = require("../models/user");
const mongoose = require("mongoose");

exports.MyProperty = async (req, res) => {
  var id = mongoose.Types.ObjectId(req.profile.id);
  const myProperties = await User.find({ _id: id });
  var properties = myProperties[0]["myProperty"];
  // console.log("myyyyy propp", myProperties[0]["_id"]);

  const allUsers = await User.find({});

  var arr = [];

  for (var i = 0; i < properties.length; i++) {
    var final = {};
    var count = 0;
    for (var j = 0; j < allUsers.length; j++) {
      // var count = allUsers[i].shortlisted.count(properties[j])
      for (var k = 0; k < allUsers[j].shortlisted.length; k++) {
        if (properties[i].uniqueId === allUsers[j].shortlisted[k].uniqueId) {
          count++;
        }
      }
      // console.log("count", allUsers[j], properties[i].uniqueId);
    }
    final["Property_id"] = properties[i]._id;
    final["count"] = count;
    properties[i].count = count;
    // console.log("pof i", properties[i].count);

    // .properties[i].count.save();

    arr.push(final);
  }

  myProperties[0].save();
  res.send(arr);
};
