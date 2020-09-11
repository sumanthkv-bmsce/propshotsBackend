const User = require("../models/user");
const { check, validationResult, cookie } = require("express-validator"); //validtr
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");
//all fringerprints
const _ = require("lodash");

var address = require("address");
const { detect } = require("detect-browser");
const { use } = require("../routes/auth");
const { userid } = require("./property");
const browser = detect();

// default interface 'eth' on linux, 'en' on osx.
var ip = address.ip(); // '192.168.0.2'
var ipv6 = address.ipv6(); // 'fe80::7aca:39ff:feb0:e67d'

address.dns(function (err, addrs) {});
var intrface = address.interface("IPv4", "eth1");

//signup check

exports.signupcheck = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  } else {
    return res.json({
      message: "successfull",
    });
  }
};
exports.signincheck = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  } else {
    return res.json({
      message: "successfull",
    });
  }
};

//Signup logic
exports.signup = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  const user = new User(req.body); //creating object for save data
  (user.browserName = browser.name), fingerprints(user);

  user.save((error, user) => {
    //its save the data

    if (error) {
      return res.status(400).json({
        error: "User Already Exist",
      });
    }
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    //puttoekn in cookie
    res.cookie("token", token, { expire: new Date() + 9999 });
    const { _id, email, name, phone, shortlisted, myProperty, lat, lon } = user;

    return res.json({
      token,
      user: { _id, email, name, phone, shortlisted, myProperty, lat, lon },
    });
  });
};
const fingerprints = (user) => {
  // (user.browserName = browser.name),
  // if (user !== undefined) {
  //   (user.browserVersion = browser.version),
  //     (user.browserOs = browser.os),
  //     (user.IP = ip),
  //     (user.IPV6 = ipv6);
  // }
};

//signinLogic
exports.signin = (req, res) => {
  const errors = validationResult(req);
  const phone = req.body.phone; //extracting data from db

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }
  User.findOne({ phone }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User does not exist",
      });
    }

    user.save(err, (user) => {
      fingerprints(user);
    });

    //create token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    //puttoekn in cookie
    res.cookie("token", token, { expire: new Date() + 9999 });
    // res.json({
    //   token: token,
    //   browserName: browser.name,
    //   browserVersion: browser.version,
    //   browserOs: browser.os,
    //   IP: ip,
    //   IPV6: ipv6,
    //   email: user.email,
    //   name: user.name,
    //   phone: user.phone,
    //   id: user._id,
    // });
    //send response to frint end

    const { _id, email, name, phone, shortlisted, myProperty, lat, lon } = user;
    return res.json({
      token,
      user: { _id, email, name, phone, shortlisted, myProperty, lat, lon },
    });
  });
};
exports.getalldata = (req, res) => {
  User.findOne({ phone }, (err, user) => {
    //find user in db
    if (err || !user) {
      return res.status(400).json({
        error: "USER  does not exist",
      });
    }
    const { _id, email, name, phone, shortlisted, myProperty } = user;
    return res.json({
      user: { _id, email, name, phone, shortlisted, myProperty },
    });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "User signout successfuly",
  });
};

// protected routes

exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  userProperty: "auth",
});

//custom middlewares
exports.isAuthenticates = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "ACCES DENIED back",
    });
  }
  next();
};

//update controllers
exports.updateUser = (req, res) => {
  product = req.product;

  // updation code
  let user = req.profile;

  const { _id, email, name, phone, shortlisted, myProperty } = user;

  user.shortlisted.push(product);
  user.save();

  return res.json({
    user: { _id, email, name, phone, shortlisted, myProperty },
  });
};

//update controllers
exports.updateignore = (req, res) => {
  product = req.product;

  // updation code
  let user = req.profile;

  // user = _.(req.profile.shortlisted, product);
  // user = _.extend(user, req.product);

  //handle of file here

  //save to db
  const { _id, email, name, phone, shortlisted, myProperty } = user;

  user.ignore.push(product);
  user.save();
  return res.json({
    user: { _id, email, name, phone, shortlisted, myProperty },
  });
  // user.((err, product) => {
  //   if (err) {
  //     return res.status(400).json({
  //       error: "updation of product failed",
  //     });
  //   }
  //   res.json(product);
  // });
};
