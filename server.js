const express = require("express");
const next = require("next");
const saml = require("samlify");
const { getUser, createToken, verifyToken } = require("./services/auth");
const fs = require("fs");
const bodyParser = require("body-parser");

const port = parseInt(process.env.PORT, 10) || 8080;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(bodyParser.json());
  const idp = saml.IdentityProvider({
    metadata: fs.readFileSync(__dirname + "/metadata/okta.xml"),
    isAssertionEncrypted: true,
    messageSigningOrder: "encrypt-then-sign",
    wantLogoutRequestSigned: true,
  });

  const sp = saml.ServiceProvider({
    entityID: "http://localhost:8080/sp/metadata?encrypted=true",
    authnRequestsSigned: false,
    wantAssertionsSigned: true,
    wantMessageSigned: true,
    wantLogoutResponseSigned: true,
    wantLogoutRequestSigned: true,
    // the private key (.pem) use to sign the assertion;
    privateKey: fs.readFileSync(__dirname + "/key/sign/privkey.pem"),
    // the private key pass;
    privateKeyPass: "VHOSp5RUiBcrsjrcAuXFwU1NKCkGA8px",
    // the private key (.pem) use to encrypt the assertion;
    encPrivateKey: fs.readFileSync(__dirname + "/key/encrypt/privkey.pem"),
    isAssertionEncrypted: true,
    assertionConsumerService: [
      {
        Binding: saml.Constants.namespace.post,
        Location: "http://localhost:8080/sp/acs?encrypted=true",
      },
    ],
  });

  server.post("/sp/acs", async (req, res) => {
    try {
      const { extract } = await sp.parseLoginResponse(idp, "post", req);
      const { login } = extract.attributes;
      console.log({ login });
      // get your system user
      const payload = getUser(login);

      // assign req user
      req.user = { nameId: login };

      if (payload) {
        // create session and redirect to the session page
        const token = createToken(payload);
        return res.redirect(`/?auth_token=${token}`);
      }
      throw new Error("ERR_USER_NOT_FOUND");
    } catch (e) {
      console.error("[FATAL] when parsing login response sent from okta", e);
      return res.redirect("/");
    }
  });

  server.get("/login", async (req, res) => {
    const { id, context } = await sp.createLoginRequest(idp, "redirect");
    const endpoint = idp.entityMeta.getSingleSignOnService("post");
    console.log({ endpoint, context });
    return res.redirect(context);
  });

  server.get("/sp/metadata", (req, res) => {
    console.log("here");
    res.header("Content-Type", "text/xml").send(idp.getMetadata());
  });

  server.get("/profile", (req, res) => {
    try {
      const bearer = req.headers.authorization.replace("Bearer ", "");
      const { verified, payload } = verifyToken(bearer);
      if (verified) {
        return res.json({ profile: payload });
      }
      return res.send(401);
    } catch (e) {
      res.send(401);
    }
  });

  server.all("*", (req, res) => {
    return handle(req, res);
  });
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
