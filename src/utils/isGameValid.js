const moment = require('moment')

const format = 'HH:mm:ss'

async function isGameValid(game) {
    let is_valid = false;
    let message = "";

    let has_next_game = false;
    let next_game_avail = false;
    let time_left = 0;

    if (game){
        //if there is a next game at time set,
        // check if the game is ready (current time > = next_game_at)
        if (game.nextGameAt !== null){
            has_next_game = true;
            next_game_avail = checkNextGame(game)
        }else{
            message = "You have no new games left for this challenge.";
        }
    }

    return {has_next_game, next_game_avail, time_left, is_valid, message}
}

function get_next_game(game) {
    let next_game = new moment(game.nextGameAt);
    // next_game = next_game.format("HH:mm:ss");
    // next_game = moment(next_game, format)

    console.log(next_game)

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
