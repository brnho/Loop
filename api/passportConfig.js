const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('User');

//override username field as email
passport.use(new LocalStrategy({ usernameField: 'email' }, (username, password, done) => {
	User.findOne({ email: username }, (err, user) => {
		if (err) { return done(err); }
		if (!user) {
			return done(null, false, { message: 'Invalid email.' });
		}
		if (!user.validPassword(password)) {
			return done(null, false, { message: 'Invalid password.' });
		}
		return done(null, user); //success
	});
}));