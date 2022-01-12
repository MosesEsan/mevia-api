const moment = require('moment')

const format = 'HH:mm:ss'

async function isGameValid(game) {
    let is_valid = false;
    let has_next_game = false;
    let next_game_avail = false;
    let message = "";
    let time_left = 0;

    if (game){
        //if the game has been submitted and next game time is available
        // if (game.submittedAt !== null && game.nextGameAt !== null){
        if (game.nextGameAt !== null){
            has_next_game = true;
            next_game_avail = checkNextGame(game)
        }
        //if the game has been submitted and next game time is not available
        // else if (game.submittedAt !== null && game.nextGameAt === null)
        else if (game.nextGameAt === null)
            message = "You have no new games left for this challenge.";
        //if the game has not been submitted and has a next game time
        // else if (game.submittedAt === null && game.nextGameAt !== null){
        //     is_valid = checkStillValid(game)
        //     has_next_game = !is_valid
        //     next_game_avail = !is_valid
        // }
        else{
            // is_valid = true;
            is_valid = false;
        }
    }

    return {has_next_game, next_game_avail, is_valid, time_left, message}
}


function get_next_game(game) {
    let next_game = new moment(game.nextGameAt);
    next_game = next_game.format("HH:mm:ss");
    next_game = moment(next_game, format)

    let check = moment()
    let message = `Next Game Starts At ${next_game}`
    let time_left = next_game.valueOf() - check.valueOf();
    return {time_left, message}
}

function checkNextGame(game) {
    let next_game = format_time(game.nextGameAt);
    // If the current time is before the next game means, next game is not ready
    return !(moment().isBefore(next_game))
}

function checkStillValid(game) {
    let next_game = format_time(game.nextGameAt);
    // If the current time is before the next game means, this game is still valid
    return moment().isBefore(next_game)
}

function format_time(time) {
    let next_game = new moment(time);
    next_game = next_game.format(format);
    next_game = moment(next_game, format)

    return next_game;
}

module.exports = {isGameValid, get_next_game};
