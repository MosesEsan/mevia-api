const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const easy = await prisma.questionType.upsert({
        where: {name: 'easy'},
        update: {},
        create: {
            name: 'easy',
            points: 250
        },
    })
    const intermediate = await prisma.questionType.upsert({
        where: {name: 'intermediate'},
        update: {},
        create: {
            name: 'intermediate',
            points: 500
        },
    })
    const hard = await prisma.questionType.upsert({
        where: {name: 'hard'},
        update: {},
        create: {
            name: 'hard',
            points: 750
        },
    })
    const bronze = await prisma.userType.upsert({
        where: {name: 'bronze'},
        update: {},
        create: {
            name: 'bronze',
            minGames: 0
        },
    })

    const silver = await prisma.userType.upsert({
        where: {name: 'silver'},
        update: {},
        create: {
            name: 'silver',
            minGames: 50
        },
    })

    const gold = await prisma.userType.upsert({
        where: {name: 'gold'},
        update: {},
        create: {
            name: 'gold',
            minGames: 100
        },
    })

    const platinum = await prisma.userType.upsert({
        where: {name: 'platinum'},
        update: {},
        create: {
            name: 'platinum',
            minGames: 200
        },
    })

    //====================================
    const game_one = await prisma.challenge.upsert({
        where: {name: 'Game 1'},
        update: {},
        create: {
            name: 'Game 1',
            daily: true,
            startTime: new Date('2021-11-04T09:00:00'),
            endTime: new Date('2021-11-04T12:00:00'),
        },
    })

    const game_two = await prisma.challenge.upsert({
        where: {name: 'Game 2'},
        update: {},
        create: {
            name: 'Game 2',
            daily: true,
            startTime: new Date('2021-11-04T13:00:00'),
            endTime: new Date('2021-11-04T16:00:00'),
        },
    })

    const game_three = await prisma.challenge.upsert({
        where: {name: 'Game 3'},
        update: {},
        create: {
            name: 'Game 3',
            daily: true,
            startTime: new Date('2021-11-04T18:00:00'),
            endTime: new Date('2021-11-04T21:00:00'),
        },
    })

    const prizes = await prisma.prize.createMany({
        data: [
            {
            name: 'Amazon Echo Show 5 (2nd Gen) Smart Speaker',
            image: "https://media.croma.com/image/upload/v1626329940/Croma%20Assets/Unclassified/Images/237645_xqc3q8.png",
            description: "",
                points: 4000
        },
            {
                name: "Amazon Echo (4th generation)",
                image: "https://www.androidcentral.com/sites/androidcentral.com/files/styles/large/public/article_images/2020/10/echo-dot-with-clock-4th-gen-2020-official-render.png",
                description: "",
                points: 3000
            },
            {
                name: "Amazon Echo Dot",
                image: "https://www.androidcentral.com/sites/androidcentral.com/files/styles/large/public/article_images/2020/09/amazon-echo-dot-4th-gen.png",
                description: "",
                points: 2000
            }

        ],
        skipDuplicates: true
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
