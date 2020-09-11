const Property = require("../models/property");
const Counter = require("../models/Counter");

const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const { Console, count } = require("console");
const user = require("../models/user");
const address = require("address");
const mongoose = require("mongoose");
let userid;
let username;
let userphone;
let uniqueId;

exports.postProperty = async (req, res) => {
  // let counval = Counter.count++;

  let counter = await Counter.find({});
  if (counter.length === 0) {
    let counter = new Counter();
    counter.save();
  }
  counter = await Counter.find({});

  counter[0].count += 1;
  counter[0].save();

  this.userid = "kkk";
  Cuser = req.profile;
  uniqueId = "prop00" + counter[0].count;

  userid = req.profile._id;
  username = req.profile.name;
  userphone = req.profile.phone;

  // address = req.profile.address;
  // console.log("this address", address);
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image",
      });
    }

    // console.log(fields)

    //destructure of fielsa
    // const { name, description, price, category, stock } = fields;

    // if (!name || !description || !price || !category || !stock) {
    //   return res.status(400).json({
    //     error: "please include all fields",
    //   });
    // }
    
    let property = new Property(fields);
    property.uniqueId = uniqueId;
    property.userid = userid;
    property.username = username;
    property.userphone = userphone;

    //handle of file here
    // console.log("//////////", file);
 
    
      for (var i = 0; i < form.openedFiles.length; i++) {
        if (i === 0) {
          property.photo.data = fs.readFileSync(form.openedFiles[i].path);
          property.photo.contentType = form.openedFiles[i].type;
          
        }
        if (i === 1) {
          property.photo1.data = fs.readFileSync(form.openedFiles[i].path);
          property.photo1.contentType = form.openedFiles[i].type;
        }
        if (i === 2) {
          property.photo2.data = fs.readFileSync(form.openedFiles[i].path);
          property.photo2.contentType = form.openedFiles[i].type;
        }
        if (i === 3) {
          property.photo3.data = fs.readFileSync(form.openedFiles[i].path);
          property.photo3.contentType = form.openedFiles[i].type;
        }
        if (i === 4) {
          property.photo4.data = fs.readFileSync(form.openedFiles[i].path);
          property.photo4.contentType = form.openedFiles[i].type;
        }
      }
      // for (var i = 0; i < file.image.length; i++) {
      //   console.log("mul image", file.allimgs2);
      // }
      // property.photo2.data = fs.readFileSync(form.openedFiles);
      // property.photo.data = fs.readFileSync(file.photo.path);
      // property.photo.contentType = file.photo.type;
  
    
    //save to db
    property.save((err, property) => {
      if (err) {
        console.log("error", err);
        return res.status(400).json({
          error: "saving property in db failed",
        });
      }

      Cuser.myProperty.push(property);
      Cuser.save();
      res.json(property);
    });
  });
};

exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("contet-type", req.product.photo.contentType);

    // var arr1 = req.product.photo.data;
    // var arr2 = req.product.photo1.data;
    // arr[2] = req.product.photo2.data;
    // arr[3] = req.product.photo3.data;
    // arr[4] = req.product.photo4.data;

    return res.send(req.product.photo.data);
  }
  next();
};

exports.photo1 = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("contet-type", req.product.photo.contentType);

    // var arr1 = req.product.photo.data;
    // var arr2 = req.product.photo1.data;
    // arr[2] = req.product.photo2.data;
    // arr[3] = req.product.photo3.data;
    // arr[4] = req.product.photo4.data;
    return res.send(req.product.photo1.data);
  }
  next();
};
exports.photo2 = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("contet-type", req.product.photo.contentType);

    // var arr1 = req.product.photo.data;
    // var arr2 = req.product.photo1.data;
    // arr[2] = req.product.photo2.data;
    // arr[3] = req.product.photo3.data;
    // arr[4] = req.product.photo4.data;
    return res.send(req.product.photo2.data);
  }
  next();
};
exports.photo3 = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("contet-type", req.product.photo.contentType);

    // var arr1 = req.product.photo.data;
    // var arr2 = req.product.photo1.data;
    // arr[2] = req.product.photo2.data;
    // arr[3] = req.product.photo3.data;
    // arr[4] = req.product.photo4.data;
    return res.send(req.product.photo3.data);
  }
  next();
};
exports.photo4 = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("contet-type", req.product.photo.contentType);

    // var arr1 = req.product.photo.data;
    // var arr2 = req.product.photo1.data;
    // arr[2] = req.product.photo2.data;
    // arr[3] = req.product.photo3.data;
    // arr[4] = req.product.photo4.data;
    return res.send(req.product.photo4.data);
  }
  next();
};
exports.getProductById = (req, res, next, id) => {
  Property.findById(id).exec((err, product) => {
    if (err) {
      return res.status(400).json({
        error: "product not found",
      });
    }
    req.product = product;
    next();
  });
};
exports.getMyProduct = (req, res) => {
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  Property.find({
    $where: { userid: userid },
  })
    .select("-photo")

    .sort([[sortBy, "asc"]])
    // .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          erros: "no product found",
        });
      }

      res.json(products);
    });
};

exports.getAllProducts = (req, res) => {
  // let limit = req.query.limit ? parseInt(req.query.limit) : 8;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  Property.find()
    .select("-photo")
    .sort([[sortBy, "asc"]])
    // .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          erros: "no product found",
        });
      }
      res.json(products);
    });
};
