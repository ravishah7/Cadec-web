import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import User from "../models/User";

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (clientID && clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "http://localhost:5000/api/auth/google/callback",
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done
      ) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();

          if (!email) {
            return done(new Error("Google account has no email address."));
          }

          let user = await User.findOne({
            $or: [
              { email },
              { providerId: profile.id }
            ]
          });

          if (user) {
            let updated = false;

            if (!user.providerId) {
              user.providerId = profile.id;
              updated = true;
            }

            if (!user.avatar && profile.photos?.length) {
              user.avatar = profile.photos[0].value;
              updated = true;
            }

            if (user.provider !== "google") {
              user.provider = "google";
              updated = true;
            }

            if (updated) {
              await user.save();
            }

            return done(null, user);
          }

          user = await User.create({
            name: profile.displayName,
            email,
            provider: "google",
            providerId: profile.id,
            avatar: profile.photos?.[0]?.value,
          });

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
}

export default passport;