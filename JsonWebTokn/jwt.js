import Jwt from 'jsonwebtoken';


export const jwtAuth = (req, res, next) => {
const token = req.headers['authorization'];

// const token=req.cookies.jwt
// console.log(token);

if (!token) {
return res.status(401).send('Unauthorized');
}

try {
const payload = Jwt.verify(token, process.env.secretkey);
next();
} catch (err) {
console.log(err);
return res.status(401).send('Unauthorized');
}
};