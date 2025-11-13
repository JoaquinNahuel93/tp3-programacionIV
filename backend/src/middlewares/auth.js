import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

export function authConfig() {
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    new Strategy(jwtOptions, async (payload, done) => {
      return done(null, payload);
    })
  );
}

export const verificarAutenticacion = passport.authenticate("jwt", {
  session: false,
});

export const verificarAutorizacion = (rol) => {
  return (req, res, next) => {
    const roles = req.user?.roles || [];
    if (!roles.includes(rol)) {
      return res
        .status(403)
        .json({ success: false, message: "Usuario no autorizado" });
    }
    next();
  };
};

