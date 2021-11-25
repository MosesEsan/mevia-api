const prisma = require("../config/prisma");

exports.checkGame = async function (challengeIdentifier, user_id) {
    try {
        let game;
        game = await prisma.game.findFirst({
            where: {
                challengeIdentifier: challengeIdentifier,
                userId:user_id,
            },
            orderBy: {
                initiatedAt: "desc"
            }
        });

        return game;
    } catch (error) {
        throw error
    }
}
