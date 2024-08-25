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
import { usercollections } from './schemas/UsersSchema.js';
import { setupSocket } from './socket.js';
import { Socket } from 'dgram';
import { jwtAuth } from './JsonWebTokn/jwt.js';



const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', 'views'); 

const server = createServer(app);
const io = new Server(server);

// io.on('connection', (socket) => {
//   console.log('User connected');


//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });

app.get('/', async (req, res) => {
 res.render("index")
});

app.use('/api', AuthRouter);
app.use('/api', jwtAuth,MessageRouter);
app.use('/api',jwtAuth, GroupRouter);

setupSocket(io);

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  mongoosedatabse(); 
});
