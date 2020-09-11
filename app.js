require("dotenv").config(); //for environment variable
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const User = require("./models/user");
const Property = require("./models/property");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
var nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
const shortid = require("shortid");
const Order = require("./models/order");
const request = require("request");
const axios = require("axios");

const propertyDetails = require("./models/property");
//extracting routes from user.js routes
const authRoutes = require("./routes/auth");

const userRoutes = require("./routes/user");

const propertyRoutes = require("./routes/property");
const myproperty = require("./routes/myproperty");
var path = require("path");

const { getUserById } = require("./controllers/user");
app.param("userId", getUserById);

//facebook

const passport = require("passport");

const session = require("express-session");

const facebookStrategy = require("passport-facebook").Strategy;

// app.listen(3000);

//made  db connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("DB CONNECTED");
  });
//middleware
// app.use(express.bodyParser({ limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors());

app.get("/check", (req, res) => {
  res.status(200).send({
    status: "OK",
  });
});

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");

//   res.header("Access-Control-Allow-Headers", "Content-Type");
//   next();
// });
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", propertyRoutes);
app.use("/api", myproperty);

const authenticator = require("otplib").authenticator;
const secret = "KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD";
authenticator.options = { digits: 6, algorithm: "sha256", step: 1 };
app.all("/", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

//signup otp
app.post("/api/user/checkforvalidate", (req, res) => {
  const phone = req.body.phonee;
  const otp = req.body.otpp;

  const body = `<SmsQueue>
                                <Account>
                                <APIKey>xEfgXwy6qUuvS0xXGuXofg</APIKey>
                                <SenderId>SANKSH</SenderId>
                                <Channel>2</Channel>
                                <DCS>0</DCS>
                                <FlashSms>0</FlashSms>
                                <Route>1</Route>
                                </Account>
                                <Messages><Message>
                                <Number>${parseInt(phone)}</Number>
                                <Text>Hello . This is the One time password(OTP) for the authentication from PropShots -----> ${otp} </Text>
                                <Text></Text>
                                </Message></Messages>
                            </SmsQueue>`;

  var config = {
    headers: {
      "Content-Type": "text/xml",
    },
  };

  axios
    .post("https://www.smsgatewayhub.com/api/mt/SendSms", body, config)
    .then((res) => {
      console.log("Success");
    });
  res.send("Successfully sent");
});

app.get("/api/user1/totp-generate", (req, res) => {
  var token = authenticator.generate(secret);
  // const user = await User.find({"_id":mongoose.Types.ObjectId(})
  res.json({
    token: token,
  });
});
app.get("/api/user/:userId/totp-generate", (req, res) => {
  var token = authenticator.generate(secret);
  // const user = await User.find({"_id":mongoose.Types.ObjectId(})
  res.json({
    token: token,
    name: req.profile.name,
    phone: req.profile.phone,
  });
});

app.post("/api/user/:userId/sendcontact", (req, res) => {
  const abc = `<SmsQueue>
            <Account>
            <APIKey>xEfgXwy6qUuvS0xXGuXofg</APIKey>
            <SenderId>SANKSH</SenderId>
            <Channel>2</Channel>
            <DCS>0</DCS>
            <FlashSms>0</FlashSms>
            <Route>1</Route>
            </Account>
            <Messages><Message>
            <Number>${req.body.phone}</Number>
            <Text> ${req.body.token} is the otp for authentication </Text>
            <Text></Text>
            </Message></Messages>
        </SmsQueue>`;

  request.post(
    {
      url: "https://www.smsgatewayhub.com/api/mt/SendSms",
      port: 8000,
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
      },
      body: abc,
    },
    (error, respn, body1) => {}
  );

  res.send(req.body);
});
app.get("/api/user/:userId/:propid/getdata", async (req, res) => {
  const propId = await mongoose.Types.ObjectId(req.params.propid);
  const property = await Property.find({ _id: propId });
  const ownerForProperty = property[0].userid;
  const userid = await mongoose.Types.ObjectId(ownerForProperty);
  const user = await User.find({ _id: userid });
  console.log("proppp", property);
  const reqUser = await User.find({
    _id: mongoose.Types.ObjectId(req.params.userId),
  });

  res.json({
    ownerId: ownerForProperty,
    name: user[0].name,
    phone: user[0].phone,
    reqUsername: reqUser[0].name,
    reqUserphone: reqUser[0].phone,
  });
});

//facebook

app.set("view engine", "ejs");
app.use(session({ secret: "ilovescotchscotchyscotchscotch" }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new facebookStrategy(
    {
      // pull in our app id and secret from our auth.js file
      clientID: "341633063518616",
      clientSecret: "d43119ab135f6f24f6228df84369b467",
      callbackURL: "http://localhost:3001/facebook/callback",
      profileFields: [
        "id",
        "displayName",
        "name",
        "gender",
        "picture.type(large)",
        "email",
      ],
    }, // facebook will send back the token and profile
    function (token, refreshToken, profile, done) {
      // asynchronous
      process.nextTick(function () {
        // find the user in the database based on their facebook id
        User.findOne({ uid: profile.id }, function (err, user) {
          // if there is an error, stop everything and return that
          // ie an error connecting to the database
          if (err) return done(err);

          // if the user is found, then log them in
          if (user) {
            console.log("user found");
            console.log("present", user);
            return done(null, user); // user found, return that user
          } else {
            // if there is no user found with that facebook id, create them
            var newUser = new User();

            // set all of the facebook information in our user model
            newUser.uid = profile.id; // set the users facebook id
            newUser.token = token; // we will save the token that facebook provides to the user
            newUser.name =
              profile.name.givenName + " " + profile.name.familyName; // look at the passport user profile to see how names are returned
            newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
            newUser.gender = profile.gender;
            newUser.pic = profile.photos[0].value;
            // save our user to the database
            newUser.save(function (err) {
              if (err) throw err;

              // if successful, return the new user
              return done(null, newUser);
            });
          }
        });
      });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.get("/home", isLoggedIn, function (req, res) {
  res.render("profile", {
    user: req.user, // get the user out of session and pass to template
  });
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

// route middleware to make sure
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();

  // if they aren't redirect them to the home page
  res.redirect("/");
}

app.get(
  "/api/auth/facebook",
  passport.authenticate("facebook", { scope: "email" })
);

app.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/home",
    failureRedirect: "/",
  })
);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kshitij@propshots.in",
    pass: "propshots@123",
  },
});

app.post("/api/contact/sendsms", (req, res) => {
  console.log("aya");
  console.log(req.body.name);
  var mailOptions = {
    from: "kshitij@propshots.in",
    to: "contact@propshots.in",
    subject: "Customer contact",
    text: `Name: ${req.body.name}
Email: ${req.body.email}
Mobile: ${req.body.mobile} 
Message:  Wants to get in contact with Propshots support`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  res.send("success");
});

//update profile

app.post("/api/userupdate/:userId", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;

  const user_id = req.params.userId;

  const user = await User.findById({ _id: mongoose.Types.ObjectId(user_id) });

  user.name = name;
  user.email = email;

  user.save();
  res.send("Successfully changed");
});

//single card

app.get("/api/:id/properties", async (req, res) => {
  const prpId = req.params.id;
  const pp = await propertyDetails.findById({
    _id: mongoose.Types.ObjectId(prpId),
  });
  res.send(pp);
});

//filter

app.post("/api/:userId/filter", async (req, res) => {
  const sale = req.body.sale;
  const rent = req.body.rent;
  const residential = req.body.residential;
  const commercial = req.body.commercial;
  const _id = req.profile.id;
  console.log("adsdssdds", req.profile.id);

  const user = await User.find({ _id: _id });

  // var options = {
  //   provider: 'google',
  //   httpAdapter: 'https',
  //   apiKey: 'AIzaSyAeEHYal9WIPtk6rwl84TVmBS34T4q7isY',
  //   formatter: 'json'
  // };

  // var geocoder = NodeGeocoder(options);
  // var city,state;
  // geocoder.reverse({lat:parseFloat(user[0].lat), lon:parseFloat(user[0].long)}, function(err, res) {
  //   console.log(res[0].city);
  //   city = res[0].city
  //   state = res[0].administrativeLevels.level1long
  //   console.log(state)

  // });

  var allProps = [];
  if (
    (sale === "" && rent === "" && residential === "" && commercial === "") ||
    (sale !== "" && rent !== "" && residential !== "" && commercial !== "") ||
    req.body.deft === true
  ) {
    allProps = await propertyDetails.find({});
  } else if (
    (sale !== "" || rent !== "") &&
    (residential !== "" || commercial !== "")
  ) {
    allProps = await propertyDetails.find({
      PropertyFor: { $in: [sale, rent] },
      PropertyType: { $in: [commercial, residential] },
    });
  } else if (sale !== "" || rent !== "") {
    allProps = await propertyDetails.find({
      PropertyFor: { $in: [sale, rent] },
    });
  } else {
    allProps = await propertyDetails.find({
      PropertyType: { $in: [commercial, residential] },
    });
  }

  var dist = [];
  if (req.body.location == "" || req.body.location === "across india") {
    dist = allProps;
  } else if (req.body.location === "properties near me") {
    for (var i = 0; i < allProps.length; i++) {
      if (user[0]._id.toString() !== allProps[i].UserId) {
        var val = geolib.getPreciseDistance(
          {
            latitude: parseFloat(user[0].lat),
            longitude: parseFloat(user[0].long),
          },
          {
            latitude: parseFloat(allProps[i].Lat),
            longitude: parseFloat(allProps[i].Lon),
          }
        );
        val /= 1000;

        if (val <= 20) {
          dist.push(allProps[i]);
        }
      }
      // console.log(user[0]._id.toString()+ ' ' + allProps[i].UserId)
    }
  } else if (req.body.location === "within city") {
    for (var i = 0; i < allProps.length; i++) {
      if (
        allProps[i].City === req.body.city &&
        user[0]._id.toString() !== allProps[i].UserId
      ) {
        dist.push(allProps[i]);
      }
    }
  } else if (req.body.location === "within state") {
    for (var i = 0; i < allProps.length; i++) {
      if (
        allProps[i].State.toString().trim() === req.body.state.toString() &&
        user[0]._id.toString() !== allProps[i].UserId
      ) {
        dist.push(allProps[i]);
      }
    }
  }

  // console.log(dist)
  var aftCur = [];

  const curYear = new Date().getFullYear().toString();

  if (req.body.new === "") {
    aftCur = dist;
  } else if (req.body.new === "New") {
    for (var i = 0; i < dist.length; i++) {
      if (dist[i].Age === curYear) {
        aftCur.push(dist[i]);
      }
    }
  }

  var aftUnderCh1 = [];
  var aftUnderCh2 = [];
  var aftUnderCh3 = [];
  if (req.body.underconst !== "" && req.body.delivered !== "") {
    if (req.body.subcheck2 === "10") {
      var lag1 = parseInt(req.body.subcheck2);
      for (var i = 0; i < aftCur.length; i++) {
        if (
          Math.abs(parseInt(aftCur[i].Age) - curYear) !== 0 &&
          Math.abs(parseInt(aftCur[i].Age) - curYear) <= lag1
        ) {
          aftUnderCh1.push(aftCur[i]);
          // console.log(Math.abs(parseInt(aftCur[i].Age) - curYear) + ' ' +parseInt(aftCur[i].Age))
        }
      }
    } else if (req.body.subcheck2 === "") {
      aftUnderCh1 = aftCur;
    }

    // console.log(aftUnderCh1)
    if (req.body.subcheck1 === "5" && req.body.subcheck2 !== "10") {
      var lag2 = parseInt(req.body.subcheck1);
      for (var i = 0; i < aftUnderCh1.length; i++) {
        if (
          Math.abs(parseInt(aftUnderCh1[i].Age - curYear)) !== 0 &&
          Math.abs(parseInt(aftUnderCh1[i].Age - curYear)) <= lag2
        ) {
          aftUnderCh2.push(aftUnderCh1[i]);
        }
      }
    } else {
      aftUnderCh2 = aftUnderCh1;
    }

    if (req.body.subcheck3 !== "") {
      var lag3 = parseInt(req.body.subcheck3);
      for (var i = 0; i < aftCur.length; i++) {
        if (Math.abs(parseInt(aftCur[i].Age - curYear)) > 10) {
          aftUnderCh3.push(aftCur[i]);
        }
      }
    } else {
      aftUnderCh3 = aftUnderCh2;
    }
  } else {
    if (req.body.underconst !== "") {
      if (req.body.subcheck2 === "10") {
        var lag1 = parseInt(req.body.subcheck2);
        for (var i = 0; i < aftCur.length; i++) {
          if (
            parseInt(aftCur[i].Age) - curYear > 0 &&
            parseInt(aftCur[i].Age) - curYear <= lag1
          ) {
            aftUnderCh1.push(aftCur[i]);
          }
        }
      } else if (req.body.subcheck2 === "") {
        aftUnderCh1 = aftCur;
      }

      if (req.body.subcheck1 === "5" && req.body.subcheck2 !== "10") {
        var lag2 = parseInt(req.body.subcheck1);
        for (var i = 0; i < aftUnderCh1.length; i++) {
          if (
            parseInt(aftUnderCh1[i].Age - curYear) > 0 &&
            parseInt(aftUnderCh1[i].Age - curYear) <= lag2
          ) {
            aftUnderCh2.push(aftUnderCh1[i]);
          }
        }
      } else {
        aftUnderCh2 = aftUnderCh1;
      }

      if (req.body.subcheck3 !== "") {
        var lag3 = parseInt(req.body.subcheck3);
        for (var i = 0; i < aftCur.length; i++) {
          if (parseInt(aftCur[i].Age) - curYear > 10) {
            aftUnderCh3.push(aftCur[i]);
          }
        }
      } else {
        aftUnderCh3 = aftUnderCh2;
      }
    } else if (req.body.delivered !== "") {
      if (req.body.subcheck2 === "10") {
        var lag1 = parseInt(req.body.subcheck2);
        for (var i = 0; i < aftCur.length; i++) {
          if (
            curYear - parseInt(aftCur[i].Age) > 0 &&
            curYear - parseInt(aftCur[i].Age) <= lag1
          ) {
            aftUnderCh1.push(aftCur[i]);
          }
        }
      } else if (req.body.subcheck2 === "") {
        aftUnderCh1 = aftCur;
      }

      if (req.body.subcheck1 === "5" && req.body.subcheck2 !== "10") {
        var lag2 = parseInt(req.body.subcheck1);
        for (var i = 0; i < aftUnderCh1.length; i++) {
          if (
            curYear - parseInt(aftUnderCh1[i].Age) > 0 &&
            curYear - parseInt(aftUnderCh1[i].Age) <= lag2
          ) {
            aftUnderCh2.push(aftUnderCh1[i]);
          }
        }
      } else {
        aftUnderCh2 = aftUnderCh1;
      }

      if (req.body.subcheck3 !== "") {
        var lag3 = parseInt(req.body.subcheck3);
        for (var i = 0; i < aftCur.length; i++) {
          if (curYear - parseInt(aftCur[i].Age) > 10) {
            aftUnderCh3.push(aftCur[i]);
          }
        }
      } else {
        aftUnderCh3 = aftUnderCh2;
      }
    } else {
      aftUnderCh3 = aftCur;
    }
  }

  // console.log(aftUnderCh3)

  res.send(aftUnderCh3);
});

//payment
const razorpay = new Razorpay({
  key_id: "rzp_test_wlUEIvmmhP5ESh",
  key_secret: "hJq2dSC7HOr9HBXRl0n1qTSw",
});
// key_id: "rzp_live_Gx4uC9Kj0zvSky",
// key_secret: "w7itM2GVELPsSg687XWbTZJJ",

app.post("/api/order", async (req, res) => {
  console.log("kkkkkkkkkkkkkkkk");
  const payment_capture = 1;
  const amount = 499;

  const currency = "INR";
  const options = {
    amount: (amount * 100).toString(),
    currency,
    receipt: shortid.generate(),
    payment_capture,
  };

  try {
    const response = await razorpay.orders.create(options);
    console.log(response);
    res.json({
      currency: response.currency,
      amount: response.amount,
      id: response.id,
    });
  } catch (error) {
    console.log(error);
  }
});

//create order
app.post("/api/order/:userId/create", async (req, res) => {
  console.log("orderfun ", req.body);
  let order = new Order(req.body);

  order.save();
});

//server port
const port = process.env.PORT || 8000;

//starting server
app.listen(port, () => {
  console.log(`app is running at ${port}`);
});
