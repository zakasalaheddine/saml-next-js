const saml = require("samlify");
const fs = require("fs");
const validator = require("@authenio/samlify-node-xmllint");

saml.setSchemaValidator(validator);

const idp = saml.IdentityProvider({
  metadata: fs.readFileSync(__dirname + "/metadata.xml"),
  isAssertionEncrypted: true,
  messageSigningOrder: "encrypt-then-sign",
  wantLogoutRequestSigned: true,
});

const sp = saml.ServiceProvider({
  entityID: "http://localhost:9003/sp/metadata?encrypted=true",
  authnRequestsSigned: false,
  wantAssertionsSigned: true,
  wantMessageSigned: true,
  wantLogoutResponseSigned: true,
  wantLogoutRequestSigned: true,
  // the private key (.pem) use to sign the assertion;
  privateKey: fs.readFileSync(__dirname + "/ssl/sign/encryptKey.pem"),
  // the private key pass;
  privateKeyPass: "isexkavv4kkg45O2B9b5d5",
  // the private key (.pem) use to encrypt the assertion;
  encPrivateKey: fs.readFileSync(__dirname + "/ssl/encrypt/encryptKey.pem"),
  isAssertionEncrypted: true,
  assertionConsumerService: [
    {
      Binding: saml.Constants.namespace.post,
      Location: "http://localhost:9003/sp/acs?encrypted=true",
    },
  ],
});

module.exports = { idp, sp };
