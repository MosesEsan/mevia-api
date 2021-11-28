const {PrismaClient} = require('@prisma/client')
const moment = require("moment");

const prisma = new PrismaClient()

const logger = require('../../logger')();

// @route GET api/prize
// @desc Returns all prizes
// @access Public
// exports.index = async (req, res) => {
//     try {
//         const prizes = await prisma.prize.findMany()
//         res.set('Access-Control-Expose-Headers', 'X-Total-Count')
//         res.set('X-Total-Count', prizes.length)
//         res.status(200).json(prizes)
//     } catch (error) {
//         console.log(error)
//         throw error
//     }
// }

exports.index = async function (req, res) {
    try {
        const today = moment().subtract(1, 'days') ;
        let start = today.startOf('week').format('YYYY-MM-DD HH:mm');
        let end = today.endOf('week').format('YYYY-MM-DD HH:mm');

        start = moment(start).add(1, 'days')
        end = moment(end).add(1, 'days')

        const prizes = await prisma.dailyPrize.findMany({
            where: {
                startDate: new Date(start),
                endDate: {
                    lte: new Date(end),
                },
            },
            select: {
                position: true,
                Prize: true
            },
        })

        res.status(200).json(prizes);
    } catch (e) {
        logger.error(e);
        res.status(500).json({success: false, message: e.message})
    }
};


//CRUD

// @route POST api/prize
// @desc Add a new prize
// @access Public
exports.store = async (req, res) => {
    try {
        const prize = await prisma.prize.create({data: {...req.body }})
        res.status(200).json(prize)
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};


// @route GET api/prize/{id}
// @desc Returns a specific prize
// @access Public
exports.show = async function (req, res) {
    try {
        const id = req.params.id;

        let prize = await prisma.prize.findUnique({where: {id: parseInt(id)}})

        res.status(200).json(prize);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};


// @route PUT api/prize/{id}
// @desc Update prize details
// @access Public
exports.update = async function (req, res) {
    try {
        const data = req.body;
        const id = req.params.id;

        const prize = await prisma.prize.update({where: { id: parseInt(id) }, data})
        res.status(200).json(prize);
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message});
    }
};




