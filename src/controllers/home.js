const {PrismaClient} = require('@prisma/client')
const moment = require("moment");

const prisma = new PrismaClient()

const logger = require('../../logger')();

// // @route GET api/user/{id}
// // @desc Returns a specific user
// // @access Public
exports.index = async function (req, res) {
    const id = req.params.id;
    try {

        let rules = {
            title: "How to play",
            data:[
                "Earn points by playing the daily challenges at 9am, 1pm and 6pm.",
                "Each challenge stays active for 3 hours and has a set number of games available.",
                "Play as many games as you want until time or point run out.",
                "There's a 30 minutes time out for each user after each game."
            ]
        }

        let redeem = {
            title: "Redeeming your points",
            data:[
                "Redeem your points for exciting prizes.",
                "Rewards are user level specific.",
                "Play more games to level up and unlock new rewards."
            ]
        }

        let panels = [rules]

        res.status(200).json({success: true, data: {panels}});
    } catch (e) {
        logger.error(e);
        res.status(500).json({success: false, message: e.message})
    }
};


