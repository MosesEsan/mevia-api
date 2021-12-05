const prisma = require('../config/prisma')

const {GoogleSpreadsheet} = require('google-spreadsheet');

const {QUESTIONS_SPREADSHEET_URL, SPREADSHEET_CREDENTIALS} = require('../config/constants');

// @route GET api/question
// @desc Returns all questions
// @access Public
exports.index = async (req, res) => {
    try {
        const questions = await prisma.question.findMany()
        res.set('Access-Control-Expose-Headers', 'X-Total-Count')
        res.set('X-Total-Count', questions.length)
        res.status(200).json(questions)
    } catch (error) {
        throw error
    }
}

//CRUD

// @route POST api/question
// @desc Add a new question
// @access Public
exports.create = async (req, res) => {
    try {
        const question = await prisma.question.create({data: {...req.body}})
        res.status(200).json(question)
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// @route GET api/question/{id}
// @desc Returns a question prize
// @access Public
exports.read = async function (req, res) {
    try {
        const id = req.params.id;

        let question = await prisma.question.findUnique({where: {id: parseInt(id)}})

        res.status(200).json(question);
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

        const question = await prisma.question.update({where: { id: parseInt(id) }, data})
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// @route POST api/auth/register
// @desc Register user and sends a verification code
// @access Public
exports.import = async (req, res) => {
    try {
        let questions = [];

        // Create a document object using the ID of the spreadsheet - obtained from its URL.
        // Initialize the sheet
        let doc = new GoogleSpreadsheet(QUESTIONS_SPREADSHEET_URL);

        // Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
        await doc.useServiceAccountAuth(SPREADSHEET_CREDENTIALS);

        await doc.loadInfo(); // loads document properties and worksheets

        const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]

        //Get levels
        const questiontypes = await prisma.questionType.findMany()

        let levels = {};
        questiontypes.forEach( (obj) => levels[obj.name] = obj.id);

        // read rows
        const rows = await sheet.getRows();
        for (const row of rows) {
            let levelsd = {};
            questiontypes.forEach( (obj) => levelsd[obj.name] = obj.id);
            let question = await addToDatabase(row, levelsd)
            questions.push(question)
        }

        return res.status(200).json({success: true, questions})
    } catch (error) {
        res.status(500).json({success: false, error})
    }
};

//Get random questions
exports.random = async () => {
    try {
        const questions = await prisma.$queryRaw`
        (SELECT q.id, qt.name as difficulty, qt.points, text, choices, answer, time from question q inner join question_type qt on q.questionTypeId = qt.id where qt.name = "Easy" ORDER BY RAND() LIMIT 1) 
        UNION (SELECT q.id, qt.name as difficulty, qt.points, text, choices, answer, time from question q inner join question_type qt on q.questionTypeId = qt.id where qt.name = "Intermediate" ORDER BY RAND() LIMIT 1) 
        UNION (SELECT q.id, qt.name as difficulty, qt.points, text, choices, answer, time from question q inner join question_type qt on q.questionTypeId = qt.id where qt.name = "Hard" ORDER BY RAND() LIMIT 1) `

        if (questions.length > 0) {
            let points_available = 0;
            let time_available = 0;
            questions.forEach((question) => {
                points_available = points_available + question["points"]
                time_available = time_available + question["time"]
                question["selected"] = null;
            });

            return {success: true, data: {questions, points_available, time_available}}
        }
        else return {success: false, "message": "No Questions Available. Try Again Later"}

    } catch (error) {
        throw error
    }
}

async function addToDatabase(row, levels) {
    const {text, choice1, choice2, choice3, choice4, answer, level, time, exported} = row;
    let questionTypeId = levels[level.toLowerCase()]

    const new_question = {
        text,
        choice_one: choice1,
        choice_two: choice2,
        choice_three: choice3,
        choice_four: choice4,
        choices: JSON.stringify([choice1, choice2, choice3, choice4]),
        answer,
        time: parseInt(time),
        questionTypeId
    };

    try {
        console.log("===========================>")
        if (exported === 'exported') {
            console.log("Already exist in database")
        } else {
            // create  new question
            await prisma.question.create({data: new_question})
            console.log("Saved to Database")
            // row.exported = 'exported';
            // row.save(() => console.log("Worksheet Updated"));
        }
        return new_question;
        console.log("===========================>")
    } catch (error) {
        throw error
    }
}
