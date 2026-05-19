import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.findOne({ email: profile.emails[0].value });
        if (user) { user.googleId = profile.id; user.authProvider = 'google'; await user.save(); }
        else {
          user = await User.create({
            fullName: profile.displayName, email: profile.emails[0].value,
            googleId: profile.id, authProvider: 'google', isVerified: true,
            avatar: profile.photos?.[0]?.value,
          });
        }
      }
      done(null, user);
    } catch (err) { done(err); }
  }));
}

if (process.env.GITHUB_CLIENT_ID) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/api/auth/github/callback',
    scope: ['user:email'],
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });
      if (!user) {
        const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
        user = await User.findOne({ email });
        if (user) { user.githubId = profile.id; user.authProvider = 'github'; await user.save(); }
        else {
          user = await User.create({
            fullName: profile.displayName || profile.username, email,
            githubId: profile.id, authProvider: 'github', isVerified: true,
            avatar: profile.photos?.[0]?.value,
          });
        }
      }
      done(null, user);
    } catch (err) { done(err); }
  }));
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try { const user = await User.findById(id); done(null, user); }
  catch (err) { done(err); }
});

export default passport;
