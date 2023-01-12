import express from "express";
import expressLayouts from "express-ejs-layouts";
import {
  loadContacts,
  addContact,
  checkDuplicate,
  deleteContact,
  updateContacts,
} from "./utils/contacts.js";
import { body, validationResult, check } from "express-validator";
import session from "express-session";
import cookieParser from "cookie-parser";
import flash from "connect-flash";

const app = express();
const port = 3000;

// Using EJS
app.set("view engine", "ejs");

// Third-party middleware
app.use(expressLayouts);
app.use(cookieParser("keyboard cat"));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 6000 },
  })
);
app.use(flash());

// Built-in middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const siswa = [
    {
      nama: "Zidan Abraham",
      email: "zidan@gmail.com",
    },
    {
      nama: "I Nyoman Suryadana",
      email: "surya@gmail.com",
    },
    {
      nama: "Rizky Ryan",
      email: "rizky@gmail.com",
    },
  ];
  res.render("index", {
    layout: "layouts/main-layout.ejs",
    title: "Home",
    nama: "Zidan Abraham",
    siswa,
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout.ejs",
    title: "About",
  });
});

app.get("/contact", (req, res) => {
  const contacts = loadContacts();

  res.render("contact", {
    layout: "layouts/main-layout.ejs",
    title: "Contact List",
    contacts,
    msg: req.flash("info"),
  });
});

app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    layout: "layouts/main-layout.ejs",
    title: "Add Contact",
    contact: req.body,
  });
});

app.post(
  "/contact",
  [
    body("nama").custom((value) => {
      const duplicate = checkDuplicate(value);
      if (duplicate) {
        throw new Error("The Name Already Exists!");
      }
      return true;
    }),
    check("email", "Invalid Email!").isEmail(),
    check("nohp", "Invalid Phone Number!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        layout: "layouts/main-layout.ejs",
        title: "Add Contact",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      addContact(req.body);
      req.flash("info", "Successfully Added Contact!");
      res.redirect("/contact");
    }
  }
);

app.get("/contact/delete/:name", (req, res) => {
  const contact = checkDuplicate(req.params.name);
  if (!contact) {
    res.status(400).send(`<h1>400 Bad Request</h1>`);
  } else {
    deleteContact(req.params.name);
    req.flash("info", "Successfully Deleted Contact!");
    res.redirect("/contact");
  }
});

app.get("/contact/edit/:name", (req, res) => {
  const contact = checkDuplicate(req.params.name);
  res.render("edit-contact", {
    layout: "layouts/main-layout.ejs",
    title: "Edit Contact",
    contact,
  });
});

app.post(
  "/contact/update",
  [
    body("nama").custom((value, { req }) => {
      const duplicate = checkDuplicate(value);
      if (value !== req.body.oldNama && duplicate) {
        throw new Error("The Name Already Exists!");
      }
      return true;
    }),
    check("email", "Invalid Email!").isEmail(),
    check("nohp", "Invalid Phone Number!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        layout: "layouts/main-layout.ejs",
        title: "Edit Contact",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      updateContacts(req.body);
      req.flash("info", "Successfully Updated Contact!");
      res.redirect("/contact");
    }
  }
);

app.get("/contact/:name", (req, res) => {
  const contact = checkDuplicate(req.params.name);

  res.render("detail", {
    layout: "layouts/main-layout.ejs",
    title: "Detail Contact",
    contact,
  });
});

app.use("/", (req, res) => {
  res.status(404);
  res.send(`<h1>404 Not Found</h1>`);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
