function rollDice(sides, times = 1) {
    const rolls = [];
    for (let i = 0; i < times; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
    }
    return rolls;
}

module.exports = rollDice;