import express from 'express';
import cors from 'cors';
import router from './routes/transactions.routes.js';

const app = express();


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.get('/health', (req, res) => {
    res.json({ ok: 'OK', message: 'Server is OK' });

});

app.use('/api/transactions', router);



export default app;
