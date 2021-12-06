const {PrismaClient} = require('@prisma/client')
const moment = require("moment");

const prisma = new PrismaClient()
const UserController = require('../controllers/user');

const logger = require('../../logger')();

// @route GET api/prize
// @desc Returns all prizes
// @access Public
exports.index = async (req, res) => {
    try {
        let prizes = await prisma.prize.findMany({
            orderBy: {points: "asc"},
            include:{
                userType:true
            }
        })

        const games_played = await prisma.game.aggregate({
            where: {
                userId: parseInt(req.user.id),
                NOT: {submittedAt: null}
            },
            _count: {id: true}
        });
        let no_of_games = games_played._count.id;

        prizes = checkIfRedeemable(prizes, no_of_games);

        console.log("ready to return")
        console.log(prizes)
        console.log("ready to return")

        res.set('Access-Control-Expose-Headers', 'X-Total-Count')
        res.set('X-Total-Count', prizes.length)
        res.status(200).json(prizes)
    } catch (error) {
        res.status(500).json({error});
    }
}

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
        res.status(500).json({error});
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
        res.status(500).json({error});
    }
};


exports.redeem = async (req, res) => {
    try {
        let can_redeem = false;
        let message = "";
        let remaining_points = 0

        const user = UserController.get_user_stats(req.user);
        const prize = await prisma.prize.findFirst({where: {id: parseInt(req.body.prize_id)}});

        if (prize){
            let points_required = prize.points;
            //if the user total games is greater than or equal to the user type min  games
            if (user.points >= points_required) {
                can_redeem = true;
                remaining_points = user.points - points_required;
            }
            else message = `You need ${points_required} points to redeem this reward.`
        }

        res.status(200).json({can_redeem, message, user_points:user.points, remaining_points })
    } catch (error) {
        res.status(500).json({error});
    }
}


// @route GET api/
// @desc R
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

        res.status(200).json({claim: new_claim, message: "You have successfully claimed your prize. \n One of our agents will contact you to confirm and arrange delivery."});
    } catch (error) {
        // delete the prizeclaim if it fails to update the weekly prize table
        await prisma.prizeClaim.delete({where: {id: new_claim.id}})
        res.status(500).json({error})
    }
}




async function checkIfRedeemable(prizes, no_of_games) {
    prizes.map((prize, idx) => {
        let canRedeem = false;
        let message = "";

        let user_type = prize.userType.name;
        let minGames = prize.userType.minGames;

        //if the user total games is greater than or equal to the user type min  games
        if (no_of_games >= minGames) canRedeem = true;
        else message = `You need to be a ${user_type.toUpperCase()} user to redeem this reward.`

        prize['can_redeem'] = canRedeem;
        prize['message'] = message;
        console.log(idx)
    })

    return prizes;
}




