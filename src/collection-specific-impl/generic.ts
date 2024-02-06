import { getCollectionRanking, getUnrevealedStatus } from '../helpers/computeRarity';
import { fetchAssets, fetchFloorPricePer } from '../requests/universalpage';

import { Asset, AssetConfig, GatherMode, RarityLookup } from '../@types';
import dayjs from 'dayjs';
import { padRight } from '../utils';
import { colorMapping, rankColorConfigPercentage } from '../config';
import chalk from 'chalk';

interface TraitFrequencies {
    [key: string]: {
        [key: string]: number;
    };
}

let scores: RarityLookup;
let percentages = {} as TraitFrequencies;

export async function fetchGenericAssets(
    assetConfig: AssetConfig,
    assetDetailsMap: Map<string, Asset>,
    gatherMode: GatherMode
) {
    if (!scores) {
        scores = await getCollectionRanking(assetConfig);
        percentages = calculatePercentages(scores);
    }
    const assets = await fetchAssets(assetConfig.assetContract, gatherMode);
    const isUnrevealed = getUnrevealedStatus();
    for (const asset of assets) {
        if (!isUnrevealed) {
            asset.rank = scores.rarity[asset.tokenId].rank;
            asset.score = scores.rarity[asset.tokenId].score;
        } else {
            asset.rank = -1;
            asset.score = -1;
        }
        assetDetailsMap.set(asset.tokenId, asset);
    }
    return assets;
}

export async function fetchGenericFloorPrice(assetConfig: AssetConfig) {
    try {
        const price = await fetchFloorPricePer(assetConfig.assetContract);
        return `Floor Prices (last sync: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}) >> ${chalk.yellowBright(price)} LYX`;
    } catch (error) {
        return `Error fetching floor price: ${error.message}`;
    }
}
export function formatGenericAsset(asset: Asset): string {
    const maxItems = scores.assetsTotal;
    const color = getColorForRank(asset.rank, maxItems);
    const price = parseFloat(asset.listingItemPrice) / 1e18;
    const timestamp = dayjs(asset.listingStartAt).format('YYYY-MM-DD HH:mm:ss');
    const tokenNamePadded = padRight(asset.tokenName, 20);
    const rankPadded = padRight(` Rank: ${asset.rank === -1 ? 'n/a' : asset.rank}`, 13);
    const pricePadded = `LYX: ${price.toFixed(2)}`;
    return color(`${timestamp}\t${tokenNamePadded}${rankPadded}${pricePadded}`);
}

export function assetDetailsGeneric(tokenId: string, assetDetailsMap: Map<string, Asset>) {
    const asset = assetDetailsMap.get(tokenId);

    return asset.tokenAttributes
        .map(attr => {
            const percentage = percentages[attr.key][attr.value];
            const value = `${attr.value} (${percentage}%)`;
            return `${padRight(attr.key, 12)}: ${padRight(value, 12)}`;
        })
        .join('\n');
}

// =========================== private helpers ================================

function calculatePercentages(data: RarityLookup) {
    // Calculate percentages for all traits including TraitCount
    for (const category in data.traitFrequencies) {
        percentages[category] = {};
        for (const trait in data.traitFrequencies[category]) {
            const count = data.traitFrequencies[category][trait];
            const percentage = (count / data.assetsTotal) * 100;
            percentages[category][trait] = parseFloat(percentage.toFixed(2)); // Keeping two decimal places for readability
        }
    }

    return percentages;
}
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
