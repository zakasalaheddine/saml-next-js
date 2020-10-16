const express = require("express");
const next = require("next");
const bodyParser = require("body-parser");
const { idp, sp } = require("./saml-auth/saml-auth-config");
const { createToken } = require("./services/auth");

const port = parseInt(process.env.PORT, 10) || 9003;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.post("/sp/acs", async (req, res) => {
    req.idp = idp;
    try {
      const {
        extract: { attributes },
      } = await sp.parseLoginResponse(idp, "post", req);
      // get your system user
      // const payload = getUser(login);
      if (attributes) {
        // create session and redirect to the session page
        const token = createToken(attributes);
        return res.redirect(`/?auth_token=${token}`);
      }
      throw new Error("ERR_USER_NOT_FOUND");
    } catch (e) {
      console.error("[FATAL] when parsing login response sent from okta", e);
      return res.redirect("/");
    }
  });

  app.get("/login", async (req, res) => {
    try {
      const { id, context } = await sp.createLoginRequest(idp, "redirect");
      return res.redirect(context);
    } catch (e) {
      console.log(e);
    }
  });

  app.get("/sp/metadata", (req, res) => {
    res.header("Content-Type", "text/xml").send(sp.getMetadata());
  });

  app.get("/idp/metadata", (req, res) => {
    res.header("Content-Type", "text/xml").send(idp.getMetadata());
  });

  app.all("*", (req, res) => {
    return handle(req, res);
  });
  app.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
