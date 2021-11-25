const prisma = require('../config/prisma')

exports.index = async (req, res) => {
    try {
        const questiontypes = await prisma.questionType.findMany()
        res.set('Access-Control-Expose-Headers', 'X-Total-Count')
        res.set('X-Total-Count', questiontypes.length)
        res.status(200).json(questiontypes)

    } catch (error) {
        console.log(error)
        throw error
    }
}
