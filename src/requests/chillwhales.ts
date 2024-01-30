import { readFileContent, writeFileContent } from '../utils';
import axios from 'axios';
import { StaticStats } from 'index';
import config from '../config';

export async function fetchStaticStats(): Promise<Record<number, number>> {
    const stats = readFileContent('cache', 'whaleScores.json');

    if (stats.indexOf('{}') !== -1) {
        try {
            const response = await axios.get<StaticStats>(config.chillWhalesScoresUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0'
                }
            });
            writeFileContent('cache', 'whaleScores.json', JSON.stringify(response.data.whalesScores, null, 2));
            return response.data.whalesScores;
        } catch (err) {
            console.log(err);
        }
    } else {
        return JSON.parse(stats);
    }
}
