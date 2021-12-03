const {PrismaClient} = require('@prisma/client')
const moment = require("moment");

const prisma = new PrismaClient()

const logger = require('../../logger')();

// @route GET api/prize
// @desc Returns all prizes
// @access Public
exports.index = async (req, res) => {
    try {
        const prizes = await prisma.prize.findMany()
        res.set('Access-Control-Expose-Headers', 'X-Total-Count')
        res.set('X-Total-Count', prizes.length)
        res.status(200).json(prizes)
    } catch (error) {
        console.log(error)
        throw error
    }
}
//
// exports.index = async function (req, res) {
//     try {
//         const today = moment().subtract(1, 'days') ;
//         let start = today.startOf('week').format('YYYY-MM-DD HH:mm');
//         let end = today.endOf('week').format('YYYY-MM-DD HH:mm');
//
//         start = moment(start).add(1, 'days') //the beginning of this week
//         end = moment(end).add(1, 'days') //the end of this week
//
//         const challenge = await prisma.weeklyChallenge.findFirst({
//             where: {
//                 startDate: new Date(start),
//                 endDate: {
//                     lte: new Date(end),
//                 },
//             }, orderBy: {createdAt: 'asc'}
//         })
//
//         if (challenge){
//             const prizes = await prisma.weeklyPrize.findMany({where: {weeklyChallengeId: challenge.id}})
//             res.status(200).json(prizes)
//         }
//
//         res.status(200).json([]);
//     } catch (e) {
//         logger.error(e);
//         res.status(500).json({success: false, message: e.message})
//     }
// };


//CRUD

// @route POST api/prize
// @desc Add a new prize
// @access Public
exports.create = async (req, res) => {
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
exports.read = async function (req, res) {
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


// @route GET api/user/{id}/prizes/
// @desc Returns all prizes for a specific user
// @access Public
exports.claim = async function (req, res) {
    try {
        const user = req.user;
        let { weeklyPrizeId } = req.body;

        const claim = await prisma.prizeClaim.findUnique({where: {weeklyPrizeId}})
        if (claim) return res.status(401).json({success: false, error: {message: `This prize was claimed on the ${claim.dateClaimed}.`}});

        let data = {...req.body, userId:user.id, dateClaimed :new Date()}

        let new_claim = await prisma.prizeClaim.create({data})

        await saveClaim(req, res, new_claim)

    } catch (error) {
        res.status(500).json({message: error.message})
    }
};



async function saveClaim(req, res, new_claim) {
    try {
        const updatedWeeklyPrize = await prisma.weeklyPrize.update({
            where: {id: parseInt(new_claim.weeklyPrizeId)},
            data: {
                claimed: true,
                dateClaimed: new_claim.dateClaimed
            }})

        console.log(updatedWeeklyPrize)

        res.status(200).json({claim: new_claim, message: "You have successfully claimed your prize. \n One of our agents will contact you to confirm and arrange delivery."});
    } catch (error) {
        // delete the prizeclaim if it fails to update the weekly prize table
        await prisma.prizeClaim.delete({where: {id: new_claim.id}})
        res.status(500).json({error})
    }
}




