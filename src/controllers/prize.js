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
        const today = moment();
        let start = today.startOf('week').format('YYYY-MM-DD HH:mm');
        let end = today.endOf('week').format('YYYY-MM-DD HH:mm');

        start = moment(start).add(1, 'days')
        end = moment(end).add(1, 'days')




        const daily_prizes = await prisma.dailyPrize.findMany({
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

        res.status(200).json({success: true, daily_prizes});
    } catch (e) {
        logger.error(e);
        res.status(500).json({success: false, message: e.message})
    }
};


