require(`dotenv`).config();
const express = require(`express`);
const multer = require(`multer`);
const { pool } = require(`pg`);
const cors = require(`cors`);
const path = require(`path`);

const app = express();
const PORT = 3000;