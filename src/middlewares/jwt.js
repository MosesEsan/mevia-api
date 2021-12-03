const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

module.exports = passport => {
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
            try {
                const user = await prisma.user.findUnique({where: { id:  jwt_payload.id}})
                if (user) return done(null, user);
                return done(null, false);
            } catch (e) {
                return done(null, false);
            }
        })
    );
};
