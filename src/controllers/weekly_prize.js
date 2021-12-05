const prisma = require('../config/prisma')
const moment = require('moment')
const {isGameValid, get_next_game} = require("../utils/isGameValid");
const {checkGame} = require("../utils/check-game");

// @route GET api/prize
// @desc Returns all prizes
// @access Public
exports.index = async (req, res) => {
    try {
        const prizes = await prisma.weeklyPrize.findMany()
        res.set('Access-Control-Expose-Headers', 'X-Total-Count')
        res.set('X-Total-Count', prizes.length)
        res.status(200).json(prizes)
    } catch (error) {
        throw error
    }
}

//CRUD

// @route POST api/prize
// @desc Add a new prize
// @access Public
exports.create = async (req, res) => {
    try {
        const prize = await prisma.weeklyPrize.create({data: {...req.body}})
        res.status(200).json(prize)
    } catch (error) {
        res.status(500).json({error});
    }
};

// @route GET api/prize/{id}
// @desc Returns a specific prize
// @access Public
exports.read = async function (req, res) {
    try {
        const id = req.params.id;

        let prize = await prisma.weeklyPrize.findUnique({where: {id: parseInt(id)}})

        res.status(200).json(prize);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

// @route PUT api/question/{id}
// @desc Update question details
// @access Public
exports.update = async function (req, res) {
    try {
        const data = req.body;
        const id = req.params.id;

        const question = await prisma.weeklyPrize.update({where: {id: parseInt(id)}, data})
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json(error);
    }
};

// @route GET api/user/{id}/prizes/
// @desc Returns all prizes for a specific user
// @access Public
exports.user_prizes = async function (req, res) {
    try {
        const user_id = req.params.id;

        let prizes = await prisma.weeklyPrize.findMany({
            where: {
                userId: parseInt(user_id)
            },
            include: {
                Prize: true,
                WeeklyChallenge: true
            },
        })

        res.status(200).json(prizes);
    } catch (error) {
        res.status(500).json(error)
    }
};


// @route GET api/user/{id}/prizes/
// @desc Returns all prizes for a specific user
// @access Public
exports.challenge_prizes = async function (req, res) {
    // try {
    //     const id = req.params.id;
    //
    //     let prizes = await prisma.weeklyPrize.findMany({
    //         where: {
    //             weeklyChallengeId: parseInt(id)
    //         },
    //         include: {
    //             Prize: true
    //         },
    //     })
    //
    //     res.status(200).json(prizes);
    // } catch (error) {
    //     res.status(500).json({message: error.message})
    // }
    try {
        const today = moment().subtract(1, 'days') ;
        let start = today.startOf('week').format('YYYY-MM-DD HH:mm');
        let end = today.endOf('week').format('YYYY-MM-DD HH:mm');

        start = moment(start).add(1, 'days') //the beginning of this week
        end = moment(end).add(1, 'days') //the end of this week
        const challenge = await prisma.weeklyChallenge.findFirst({
            where: {
                startDate: new Date(start),
                endDate: {lte: new Date(end)},
            },
            include: {
                WeeklyPrize: {
                    include: {
                        Prize: true
                    },
                }
            },
            orderBy: {createdAt: 'asc'}
        })

        if (challenge && challenge.WeeklyPrize.length > 0) res.status(200).json(challenge.WeeklyPrize)
        else res.status(401).json({error: {message: "No Prizes available."}})
    } catch (error) {
        res.status(500).json({error})
    }
};
