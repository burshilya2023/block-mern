import express from 'express';
import fs from 'fs';
import multer from 'multer';
import cors from 'cors';

import mongoose from 'mongoose';

import { registerValidation, loginValidation, postCreateValidation } from './validations.js';

import { handleValidationErrors, checkAuth } from './utils/index.js';


import { UserController, PostController } from './controllers/index.js';

mongoose
  .connect('mongodb+srv://admin:wwwwwwww@mernpost.jwokmth.mongodb.net/blogs?retryWrites=true&w=majority')
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express();


// создаем хранилище для картинок
const storage = multer.diskStorage({
  // функция которая ожидает запрос, файл, колбек
  destination: (_, __, cb) => {
    // 
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    // если нету ошибок то сохраняй файлы в папке uploads
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });


app.use(express.json());
app.use(cors());
// если приходит запрос на uploads то возьми функцию static и проверь есть ли в этой папке что я передаю и уже из папки передавай картинки
app.use('/uploads', express.static('uploads'));

// проверка валидации на вход(email password)
app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
// проверка на валидацию формы у пользователяя
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
// проверка что вообще можем ли получать инфу о себе
app.get('/auth/me', checkAuth, UserController.getMe);



// если придет запрос на upload  то мы будем middlewr from multor ожидаем свойсвто image с картинкой
// если все пришло, то в ответе говорим что все отлично, и говорим где сохранили картинку
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get('/tags', PostController.getLastTags);

app.get('/posts', PostController.getAll);
app.get('/posts/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);

app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update,
);

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Server OK');
});
