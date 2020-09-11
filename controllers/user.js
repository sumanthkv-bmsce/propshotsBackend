const User = require("../models/user");

let userid;

exports.getUserById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "No user was found in DB",
      });
    }
    req.profile = user;

    userid = user._id;
    next();
  });
};

exports.getUser = (req, res) => {
  // req.profile.createdAt = undefined;
  // req.profile.updatedAt = undefined;
  return res.json(req.profile);
};

exports.updateUser = async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;

  const user_id = req.params.userId;

  const user = await User.findById({ _id: mongoose.Types.ObjectId(user_id) });

  user.name = name;
  user.email = email;

  user.save();
  res.send("Successfully changed");
};
