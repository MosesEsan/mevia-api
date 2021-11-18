require('dotenv').config();

const express = require('express');
const cors = require('cors');
const passport = require("passport");

// Setting up port
let PORT = process.env.PORT || 3001;

//=== 1 - CREATE APP
// Creating express app and configuring middleware needed for authentication
const app = express();

app.use(cors());

// for parsing application/json
app.use(express.json());

// for parsing application/xwww-form-urlencoded
app.use(express.urlencoded({ extended: false }));

//=== 2 - INITIALIZE PASSPORT MIDDLEWARE
app.use(passport.initialize());
require("./middlewares/jwt")(passport);

//=== 4 - CONFIGURE ROUTES
//Configure Route
require('./routes/index')(app);

//=== 5 - START SERVER
app.listen(PORT, () => console.log('Server running on http://localhost:'+PORT+'/'));
