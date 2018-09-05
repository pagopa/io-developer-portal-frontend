const GetMessageWorker = new Worker("./getMessage.js");
const GetProfileWorker = new Worker("./getProfile.js");

module.exports = {
  GetMessageWorker,
  GetProfileWorker
};
