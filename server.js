const express = require('express');
const cors = require('cors');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
require('dotenv').config();

// *********************** MIDDLEWARES *********************** //
app.use(cors());
app.use(express.json());
// *********************************************************** //

//-----EJS---------//
app.use(expressLayouts);
app.use("/assets", express.static('./assets'));
app.set('view engine', 'ejs');

//---------Express Session----------//
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

//---------Connect Flash----------//
app.use(flash());

//---------Global Variables----------//
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// *********************** ROUTE CONFIG ********************** //
app.use('/admin', require('./admin'));
const homeListingRoute = require('./routes/homeListing');
const homeFetchApplyRoute = require('./routes/homeFetchApply');
const tenantRoute = require('./routes/tenantRouter');
const landlordRoute = require('./routes/landlordRouter');
// *********************************************************** //

// *********************** ROUTES **************************** //
app.use(homeListingRoute);
app.use(homeFetchApplyRoute);
app.use(tenantRoute);
app.use(express.urlencoded({ extended: false }));
app.use(landlordRoute);
// *********************************************************** //

// *********************** SERVER ENTRY ********************** //
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
})
// *********************************************************** //

// ********************** MongoDB CONFIG ********************** //
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch(err => console.log(err));
// *********************************************************** //
