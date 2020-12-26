const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    locations: {
        type: [String],
        required: false
    },
    resetKey: {
        type: String,
        required: false
    }
});
UserSchema.pre('save', function (next) {
    var user = this;
    if (user.isModified("password")) {
        bcrypt.hash(user.password, 10, function (err, hash) {
            if (err) return next(error);
            user.password = hash;
            next();
        });
    } else {
        next();
    }
});

UserSchema.methods.validPassword = function(password, cb) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
        if (err) return cb(err);
        return cb(null, isMatch);
    });
};

var User = mongoose.model("User", UserSchema);

module.exports = User;