const {PrismaClient} = require('@prisma/client')

const prisma = new PrismaClient()

const logger = require('../../logger')();

// // @route GET api/user/{id}
// // @desc Returns a specific user
// // @access Public
exports.show = async function (req, res) {
    const id = req.params.id;
    try {
        let user = await prisma.user.findUnique({where: {id: parseInt(id)}})
        user = await get_user_stats(user, id)

        res.status(200).json({success: true, user});

    } catch (e) {
        logger.error(e);
        res.status(500).json({success: false, message: e.message})
    }
};

const get_user_stats = async (user) => {
    try{
        const game_points = await prisma.game.aggregate({
            where: {
                userId: parseInt(user.id),
                NOT: {
                    submittedAt: null
                },
            },
            _sum: {
                pointsObtained: true,
            },
            _count: {
                id: true,
            },
        })


        let {_sum, _count} = game_points;
        let points_total = _sum.pointsObtained;
        let no_of_games = _count.id;

        const user_points = await prisma.userPoints.aggregate({
            where: {user_id: parseInt(user.id)},
            _sum: {
                points: true,
            },
        })

        const user_types = await prisma.userType.findMany();

        let current = null
        let next = null
        user_types.map((user_type, idx) => {
            if (current === null && user_type.minGames <= no_of_games){
                current = user_type;
            }else if (current !== null && user_type.minGames <= no_of_games && (user_type.minGames > current.minGames) ){
                current = user_type;
            }else if (current !== null && next === null && user_type.minGames > no_of_games ){
                next = user_type;
            }
        })

        let user_type = {current, next}
        user['points'] = points_total + user_points._sum.points;
        user['no_of_games'] = no_of_games;
        user['user_type'] = user_type;

        return user;
    }catch (e) {
        throw e;
    }
}

exports.get_user_stats = get_user_stats;

