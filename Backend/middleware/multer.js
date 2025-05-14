// const multer = require("multer");
// const path = require("path");



// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "../upload"));
//   },
//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname); // get real extension
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random());
//     cb(null, file.fieldname + '-' + uniqueSuffix + ext);
//   }
// });



// const upload = multer({ storage });

// module.exports = { upload };