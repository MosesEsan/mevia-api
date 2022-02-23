const prisma = require('../config/prisma')
const moment = require("moment");

// @route GET
// @desc
// @access Public
exports.index = async (req, res) => {
    try {
        const user = req.user;

        let today = moment();
        let start = today.startOf('day').format('YYYY-MM-DD HH:mm');
        const daily_rewards = await prisma.dailyReward.findFirst({
            where: {
                userId: parseInt(user.id),
                createdAt: {gte: new Date(start)},
            },
        })

        let available = (!daily_rewards);
        res.status(200).json(available)
    } catch (error) {
        res.status(500).json(error);
    }
}

//CRUD

// @route POST
// // @desc
// // @access Public
exports.create = async (req, res) => {
    try {
        const user = req.user;
        const daily_reward = await prisma.dailyReward.create({data: {userId:user.id}})
        res.status(200).json(false)
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};


// @route GET api
// // @desc
// // @access Public
exports.read = async function (req, res) {
    try {
        const id = req.params.id;

        let winner = await prisma.tournamentWinner.findMany({
            where: {id: parseInt(id)},
            include: {
                TournamentPrize: {
                    include: {
                        Prize: true,
                        Tournament: true
                    },
                }
            },
        })
        res.status(200).json(winner);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

// @route PUT api
// // @desc
// // @access Public
exports.update = async function (req, res) {
    try {
        const data = req.body;
        const id = req.body.reward_id;

        const reward = await prisma.tournamentWinner.update({where: { id: parseInt(id) }, data})

        res.status(200).json(reward);
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.redeem = async (req, res) => {
    try {
        const user = req.user;
        const id = req.body.reward_id;

        let reward = await prisma.tournamentWinner.findFirst({where: {id: parseInt(id), userId: parseInt(user.id)}});
        if (!reward) return res.status(401).json({message: "This reward does not exist."});

        let data = {claimed:true, dateClaimed:new Date()}
        reward = await prisma.tournamentWinner.update({where: { id: parseInt(id) },
            include: {
                TournamentPrize: {
                    include: {
                        Prize: true,
                        Tournament: true
                    },
                }
            },data})

        res.status(200).json(reward);
    } catch (error) {
        res.status(500).json(error);
    }
}
