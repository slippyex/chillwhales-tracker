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

// entries here are safe to edit
export const rankColorConfig = [
    { maxRank: 500, color: 'red' },
    { maxRank: 1000, color: 'yellow' },
    { maxRank: 3000, color: 'green' },
    { maxRank: 5000, color: 'blue' },
    { maxRank: 7000, color: 'white' },
    { maxRank: Infinity, color: 'magenta' } // Default color for ranks above 7000
];

export const rankColorConfigPercentage = [
    { percentage: 5, color: 'red' }, // Top 5%
    { percentage: 10, color: 'yellow' }, // Top 10%
    { percentage: 30, color: 'green' }, // Top 30%
    { percentage: 50, color: 'blue' }, // Top 50%
    { percentage: 70, color: 'white' }, // Top 70%
    { percentage: 100, color: 'magenta' } // Remaining
];

export const colorMapping: { [key: string]: chalk.Chalk } = {
    red: chalk.red,
    yellow: chalk.yellow,
    green: chalk.green,
    blue: chalk.blue,
    white: chalk.white,
    magenta: chalk.magenta
};
