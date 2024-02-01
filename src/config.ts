import chalk from 'chalk';

const chillWhalesContract = '0x86e817172b5c07f7036bf8aa46e2db9063743a83';

export default {
    amountToFetch: 50,
    periodToFetchAssets: 30 * 1000,
    periodToFetchFloor: 60 * 1000,
    chainEndpoint: 'https://rpc.mainnet.lukso.network',
    chillContractAddress: '0x5B8B0E44D4719F8A328470DcCD3746BFc73d6B14',
    burntWhalesContractAddress: '0x8bF5bf6C2F11643E75Dc4199AF2C7D39B1AEFcD3',
    universalPageCollectionBase: 'https://universal.page/api/assets/0x86e817172b5c07f7036bf8aa46e2db9063743a83/tokens',
    universalPageHistoryBase: 'https://universal.page/api/assets/history/0x86e817172b5c07f7036bf8aa46e2db9063743a83',
    chillWhalesScoresUrl: 'https://chillwhales-data-production.up.railway.app/data'
};

export const universalPage = {
    history: `https://universal.page/api/assets/history/${chillWhalesContract}`,
    tokens: `https://universal.page/api/assets/${chillWhalesContract}/tokens`
};

// entries here are safe to edit
export const rankColorConfig = [
    { maxRank: 500, color: 'red' },
    { maxRank: 1000, color: 'yellow' },
    { maxRank: 3000, color: 'green' },
    { maxRank: 5000, color: 'blue' },
    { maxRank: 7000, color: 'white' },
    { maxRank: Infinity, color: 'grey' } // Default color for ranks above 7000
];

export const colorMapping: { [key: string]: chalk.Chalk } = {
    red: chalk.red,
    yellow: chalk.yellow,
    green: chalk.green,
    blue: chalk.blue,
    white: chalk.white,
    grey: chalk.grey
};
