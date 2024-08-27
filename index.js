import "dotenv/config";
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { mongoosedatabse } from './mongodbconfig.js';
import AuthRouter from './Routes/AuthRoute.js';
import MessageRouter from './Routes/MessageRouter.js';
import GroupRouter from './Routes/GroupRoute.js';
import { setupSocket } from './socket.js';
import { jwtAuth } from './JsonWebTokn/jwt.js';

import swagger from "swagger-ui-express";

import apiDocs from "./swagger.json" assert {type:"json"};

import cors from "cors";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);






export const app = express();

const corsOptions = {
  origin: '*', // Allow only requests from this origin
  methods: 'GET,POST' // Allow only these methods
};
app.use(cors(corsOptions))

app.use("/api-docs",swagger.serve,swagger.setup(apiDocs))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');


const server = createServer(app);
const io = new Server(server);

// io.on('connection', (socket) => {
//   console.log('User connected');


//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });



app.get('/', async (req, res) => {
  res.send(`<h1>This is Just An API Project</h1>
<h3>Please Visit <a href="https://real-time-chat-application-api.onrender.com/api-docs">https://real-time-chat-application-api.onrender.com/api-docs</a>   For Api Documentation</h3>

    <h5>Note : - <span>Please be patient as it may take up to one minute to load. The application is hosted on Render's free hosting service, which may take a few extra seconds to load.</span></h5>`

    )
 });

 app.get('/2', async (req, res) => {
  res.send("ok")
 });


app.use('/api', AuthRouter);
app.use('/api', jwtAuth,MessageRouter);
app.use('/api',jwtAuth, GroupRouter);

setupSocket(io);

app.use((req, res) => {
  res.status(404).send('Not Found');
});


app.use((err, req, res, next) => {

  console.log(err)
 
    res.send('internal server problem');
  
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  mongoosedatabse(); 
});
