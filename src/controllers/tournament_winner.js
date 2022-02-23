const prisma = require('../config/prisma')

// @route GET
// @desc
// @access Public
exports.index = async (req, res) => {
    try {
        const winners = await prisma.tournamentWinner.findMany()
        res.set('Access-Control-Expose-Headers', 'X-Total-Count')
        res.set('X-Total-Count', winners.length)
        res.status(200).json(winners)
    } catch (error) {
        throw error
    }
}

//CRUD

// @route POST
// // @desc
// // @access Public
exports.create = async (req, res) => {
    try {
        const winner = await prisma.tournamentWinner.create({data: {...req.body}})
        res.status(200).json(winner)
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
