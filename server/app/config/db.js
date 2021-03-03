import mongoose from 'mongoose';

export default async () => {
    mongoose.connect(`mongodb+srv://admin:${process.env.MONGO_AUTH}@cluster0.nxvhj.mongodb.net/pianopet?retryWrites=true&w=majority`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }).then(() => {
        console.log('Connected to MongoDB');
    }).catch(err => {
        console.error('Connection error', err);
    });
}