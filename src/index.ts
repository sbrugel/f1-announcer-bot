import DiscordJS, { Intents, TextChannel } from 'discord.js';
import { BOT, DATA } from './config';
import axios from 'axios';
import cron from 'cron';

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
});

client.login(BOT.TOKEN);

client.on('ready', async () => {
    console.log('Ready!');
    main();

    let job = new cron.CronJob('0 0 * * *', main);
    job.start();
});

function checkForRace(race: Race) {
    let current = new Date(),
        month = (current.getMonth() + 1) < 10 ? '0' + (current.getMonth() + 1) : (current.getMonth() + 1),
        day = current.getDate() < 10 ? '0' + current.getDate() : current.getDate(),
        year = current.getFullYear();

    let dateData = race.date.split('-');
    let timeData = race.time.substring(0, race.time.length - 1).split(':');
    timeData[0] = (parseInt(timeData[0]) - DATA.HOUR_OFFSET).toString();
    if (year.toString() === dateData[0] && month.toString() === dateData[1] && day.toString() === dateData[2]) {
        const chan = client.channels.cache.get(BOT.CHANNEL as string) as TextChannel
        chan.send('There is an F1 race today at ' + timeData.join(':') + ', located at ' + race.Circuit.circuitName + ': ' + race.raceName);
    }
}

function main() {
    axios.get('http://ergast.com/api/f1/current.json')
        .then(response => {
            let races = response.data.MRData.RaceTable.Races as Array<Race>;
            for (let race of races) {
                checkForRace(race);
                checkForRace(race.Qualifying);
            }
        });
}
