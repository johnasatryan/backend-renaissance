require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
// const fileUpload = require('express-fileupload');
const app = express();
const PORT = process.env.PORT;
const fs = require('fs');

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.set('view engine', 'ejs');
app.set(path.join(__dirname, 'views', 'public'));
app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));
// app.use(
//   fileUpload({
//     limits: { fileSize: 50 * 1024 * 1024 },
//   })
// );

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === '/jpg') {
      return cb(null, true);
    }
    cb(new Error('File must be image'), false);
  },
});

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/api/uploads', (req, res) => {
  const { file, fileName } = req.body;

  const newFile = Buffer.from(file, 'base64');

  const filePath = path.join(__dirname, 'uploads', Date.now() + fileName);
  fs.writeFile(filePath, newFile, (err) => {
    if (err) {
      return res.status(500).json({ message: err });
    }
    res.json({ message: 'File uploaded successfully' });
  });
});

// app.post('/api/uploads-formData', (req, res) => {
//   if (!req.files) {
//     return res.status(500).json({ message: 'File not found' });
//   }

//   const data = req.files.file;
//   const filePath = path.join(__dirname, 'uploads', Date.now() + data.name);

//   data.mv(filePath, data.data, (err) => {
//     if (err) {
//       res.status(500).json({ message: err });
//     }
//   });
//   res.json({ message: 'File uploaded successfully' });
// });

app.post('/api/uploads-multer', upload.single('file'), (req, res) => {
  res.json({ message: 'File uploaded successfully' });
});
app.listen(PORT, () => {
  console.log(`Server runing on http://localhost:${PORT}`);
});
