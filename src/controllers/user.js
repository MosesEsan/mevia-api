const prisma = require('../config/prisma')

const logger = require('../../logger')();

// @route GET api/user
// @desc Returns all userss
// @access Public
exports.index = async (req, res) => {
    try {
        const users = await prisma.user.findMany()
        res.set('Access-Control-Expose-Headers', 'X-Total-Count')
        res.set('X-Total-Count', users.length)
        res.status(200).json(users)
    } catch (error) {
        console.log(error)
        throw error
    }
}

// // @route GET api/user/{id}
// // @desc Returns a specific user
// // @access Public
exports.read = async function (req, res) {
    const id = req.params.id;
    try {
        let user = await prisma.user.findUnique({where: {id: parseInt(id)}})
        user = await get_user_stats(user, id)
        res.status(200).json(user);

    } catch (e) {
        logger.error(e);
        res.status(500).json({success: false, message: e.message})
    }
};

// @route PUT api/user/{id}
// @desc Update user details
// @access Public
exports.update = async function (req, res) {
    try {
        let user_id = req.user.id;
        const data = req.body;
        const id = req.params.id;

        //Make sure the passed id is that of the logged in user
        if (user_id.toString() !== id.toString()) return res.status(401).json({error :{message: "Sorry, you don't have the permission to update this data."}});

        const user = await prisma.user.update({where: { id: parseInt(id) }, data})
        res.status(200).json(user);
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message});
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

// @route GET api/user/{id}
// @desc Returns a specific user
// @access Public
exports.profile_image = async function (req, res) {
    try {
        if (!req.file)  return res.status(400).json({error: {message: 'No files were uploaded.'}});

        const id = req.params.id;
        console.log(JSON.stringify(req.file))

        const user = await prisma.user.update({where: { id: parseInt(id) }, data:{image:req.file.path}})

        res.status(200).json(user);
    } catch (e) {
        logger.error(e);
        res.status(500).json({success: false, message: e.message})
    }
};

// @route GET api/user/{id}/games
// @desc Returns all games for a specific user
// @access Public
exports.games = async function (req, res) {
    try {
        const id = req.params.id;

        const games = await prisma.game.findMany({
            where: {
                userId: parseInt(id),
                NOT: {
                    submittedAt: null
                },
            }
        })

        console.log(games)

        res.status(200).json(games);
    } catch (e) {
        logger.error(e);
        res.status(500).json({success: false, message: e.message})
    }
};


exports.get_user_stats = get_user_stats;

