require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");

const { validateToken } = require('./src/middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended: false}));
app.use('/public', express.static('public'));
app.use(cookieParser());

app.set('trust proxy', true)
app.set('view engine', 'ejs');


// Routers
const authRouter = require('./src/routes/auth');
app.use("/auth", authRouter);

const encRouter = require('./src/routes/enc');
app.use("/enc", encRouter);
/***/

app.get('/', validateToken, (req, res) => {
    res.render('index.ejs', {userName: req.user.firstName});
    console.log(req.ip);
});

app.listen(PORT || 3030, () => {
    console.log(`Server listening on port ${PORT}.`);
  });

