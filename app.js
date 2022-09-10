const path = require("path");
const express = require("express");
const expressHbs = require("express-handlebars");
const sequelize = require("./util/database");
const Users = require("./models/User");
const Tasks = require("./models/Tasks");
const Records = require("./models/Records");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const session = require("express-session");
const flash = require("connect-flash");
const csrf = require("csurf");
const csrfProtection = csrf();

const errorController = require("./controllers/ErrorController");

const app = express();

const getData = require("./util/helpers/hbs/getData");

app.engine(
  "hbs",
  expressHbs({
    layoutsDir: "views/layouts/",
    defaultLayout: "main-layout",
    extname: "hbs",
    helpers: {
      getDate: getData.GetDate,
      isExpired: getData.IsExpired,
      getMinutes: getData.GetMinutes,
    },
  })
);

app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.urlencoded({ extended: false }));

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

app.use(multer({ storage: fileStorage }).single("ImagePath"));

app.use(express.static(path.join(__dirname, "public")));

app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  session({ secret: "anything", resave: true, saveUninitialized: false })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session) {
    return next();
  }
  if (!req.session.user) {
    return next();
  }
  Users.findByPk(req.session.user.id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use((req, res, next) => {
  const errors = req.flash("errors");
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.errorMessages = errors;
  res.locals.hasErrorMessages = errors.length > 0;
  res.locals.csrfToken = req.csrfToken();
  next();
});

const authRouter = require("./routes/auth");
const homeRouter = require("./routes/taskRouter");

app.use(authRouter);
app.use(homeRouter);

app.use(errorController.Get404);

//relationships between users and tasks

Tasks.belongsTo(Users, { constraint: true, onDelete: "CASCADE" });
Users.hasMany(Tasks);
Records.belongsTo(Users, { constraint: true, onDelete: "NO ACTION" });
Users.hasMany(Records);

sequelize
  .sync()
  .then((result) => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
