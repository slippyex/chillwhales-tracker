import { Asset, AssetFormatListFunctionContainer } from 'index';
import dayjs from 'dayjs';
import { padRight } from '../utils';
import { formatChillWhalesListEntry } from '../collection-specific-impl/chillWhales';
import { colorMapping, rankColorConfigPercentage } from '../config';
import { scores } from './fetchAssets';
import chalk from 'chalk';

function calculateDynamicMaxRanks(totalItems: number, config: typeof rankColorConfigPercentage) {
    return config.map(entry => ({
        ...entry,
        maxRank: Math.ceil((entry.percentage / 100) * totalItems)
    }));
}

function getColorForRank(rank: number, totalItems: number) {
    const dynamicConfig = calculateDynamicMaxRanks(totalItems, rankColorConfigPercentage);
    const color = dynamicConfig.find(entry => rank <= entry.maxRank)?.color || 'magenta'; // Default to 'magenta' if no match
    return colorMapping[color] || chalk.grey; // Default to grey if color not found
}

export const formatAssetListFunctions: AssetFormatListFunctionContainer = {
    chillWhales(asset: Asset): string {
        return formatChillWhalesListEntry(asset);
    },
    generic(asset: Asset): string {
        const maxItems = scores.assetsTotal;
        const color = getColorForRank(asset.rank, maxItems);
        const price = parseFloat(asset.listingItemPrice) / 1e18;
        const timestamp = dayjs(asset.listingStartAt).format('YYYY-MM-DD HH:mm:ss');
        const tokenNamePadded = padRight(asset.tokenName, 20);
        const rankPadded = padRight(` Rank: ${asset.rank}`, 13);
        const pricePadded = `LYX: ${price.toFixed(2)}`;
        return color(`${timestamp}\t${tokenNamePadded}${rankPadded}${pricePadded}`);
    }
};
