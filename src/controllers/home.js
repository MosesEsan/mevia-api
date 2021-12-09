const {PrismaClient} = require('@prisma/client')
const moment = require("moment");
const UserController = require("./user");
const ChallengeController = require("./challenge");
const LeaderBoardController = require("./leaderboard");

const prisma = new PrismaClient()

const logger = require('../../logger')();

// // @route GET api/user/{id}
// // @desc Returns a specific user
// // @access Public
exports.index = async function (req, res) {
    let user_id = req.user.id;

    try {
        //User Info - UserCard
        let user = null;
        let user_error = null;
        try {
            let user = await prisma.user.findUnique({where: {id: parseInt(user_id)}})
            user = await UserController.get_user_stats(user)
        } catch (error) {
            user_error = error
        }

        //Challenge - GameCard
        let challenge = null;
        let challenge_error = null;
        try {
            const weekly_challenge = await ChallengeController.checkWeeklyChallenge();
            if (weekly_challenge && weekly_challenge.WeeklyPrize.length > 0){
                challenge = await ChallengeController.checkChallenges(user_id, weekly_challenge);
            }else{
                challenge_error = {error: {message: "No Challenges available."}}
            }
        } catch (error) {
            challenge_error = error
        }

        //Leaderboard - WinnersCard
        let leaderboard = null;
        let leaderboard_error = null;
        let leaderboard_title = null;
        try {
            let type = "week";

            leaderboard = await LeaderBoardController.runQuery(type)

            if (leaderboard.length === 0){
                type = "month"
                leaderboard = await LeaderBoardController.runQuery("month")
            }

            leaderboard.map((user, idx) => {
                // user['id'] = idx + 1;
                user['rank'] = idx + 1;
            })


            leaderboard_title = `Top leaders of the ${type}`
        } catch (error) {
            leaderboard_error = error
        }


        //Marketplace - MarketplaceCard
        let prizes = null;
        let prizes_error = null;
        try {
            prizes = await prisma.prize.findMany({
                orderBy: {points: "asc"},
                include:{
                    UserType:true
                }
            })
        } catch (error) {
            prizes_error = error
        }

        //FAQ -
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
        let data = {
            user, user_error,
            challenge, challenge_error,
            leaderboard, leaderboard_error, leaderboard_title,
            prizes, prizes_error,
            panels
        }

        console.log(challenge, challenge_error,)

        res.status(200).json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({error})
    }

};


