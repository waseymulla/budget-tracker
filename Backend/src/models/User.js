//schema for user model in MongoDB using mongoose  username: required and string, password: requireed and string, createdAt, updatedAt

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        maxlength: 20,
        minlength: 5
        
    },
    passwordHash: {
        type: String,
        required: true,
        select: false, //doesnt return hashed password by default in queries
        minlength: 8
    }
}, {
    timestamps: true
    
});

userSchema.index({ username: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);



export default User;