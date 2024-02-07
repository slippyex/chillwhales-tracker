import chalk from 'chalk';

export default {
    amountToFetch: 100,
    periodToFetchAssets: 30 * 1000,
    periodToFetchFloor: 60 * 1000,
    chainEndpoint: 'https://rpc.mainnet.lukso.network',
    chillContractAddress: '0x5B8B0E44D4719F8A328470DcCD3746BFc73d6B14',
    burntWhalesContractAddress: '0x8bF5bf6C2F11643E75Dc4199AF2C7D39B1AEFcD3',
    universalPageCollectionBase: 'https://universal.page/api',
    universalPageWebsiteCollectionBase: 'https://universal.page/collections',
    chillWhalesScoresUrl: 'https://chillwhales-data-production.up.railway.app/data',
    openUrlIn: 'chrome'
};

export const rankColorConfigPercentage = [
    { percentage: 1, color: 'red', label: 'Mythical' }, // mythical:        Top 1%
    { percentage: 5, color: 'magenta', label: 'Epic' }, // epic:            Top 5%
    { percentage: 10, color: 'yellow', label: 'Extremely Rare' }, // extremely rare:  Top 10%
    { percentage: 25, color: 'cyan', label: 'Rare' }, // rare:            Top 25%
    { percentage: 50, color: 'green', label: 'Uncommon' }, // uncommon:        Top 50%
    { percentage: 100, color: 'white', label: 'Common' } // common:          Everyone else
];
export const colorMapping: { [key: string]: chalk.Chalk } = {
    red: chalk.redBright,
    magenta: chalk.magentaBright,
    yellow: chalk.yellowBright,
    cyan: chalk.cyanBright,
    green: chalk.greenBright,
    white: chalk.whiteBright
};
