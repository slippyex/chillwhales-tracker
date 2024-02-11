import { getCollectionRanking, getUnrevealedStatus } from '../helpers/computeRarity';
import { fetchAssets, fetchFloorPricePer } from '../requests/universalpage';

import { Asset, AssetConfig, GatherMode, RarityLookup } from '../@types';
import dayjs from 'dayjs';
import { getColorForRank, padRight } from '../utils';
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
            asset.rank = scores.rarity[asset.tokenId]?.rank || -1;
            asset.score = scores.rarity[asset.tokenId]?.score || -1;
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
        await initializeGenericScores(assetConfig);
        const price = await fetchFloorPricePer(assetConfig.assetContract);
        return `Floor Prices (last sync: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}) >> ${chalk.yellowBright(price)} LYX`;
    } catch (error) {
        return `Error fetching floor price: ${error.message}`;
    }
}
export function formatGenericAsset(asset: Asset): string {
    const maxItems = scores.assetsTotal;
    const colorSet = getColorForRank(asset.rank, maxItems);
    const price = parseFloat(asset.listingItemPrice) / 1e18;
    const timestamp = dayjs(asset.listingStartAt).format('YYYY-MM-DD HH:mm:ss');
    const tokenNamePadded = padRight(asset.tokenName || asset.assetName, 20);
    const rankPadded = padRight(` Rank: ${asset.rank === -1 ? 'n/a' : asset.rank}`, 13);
    const pricePadded = `LYX: ${price.toFixed(2)}`;
    asset.rankClassification = colorSet.label;
    return colorSet.color(`${timestamp}\t${tokenNamePadded}${rankPadded}${pricePadded}`);
}

export function formatGenericWalletAsset(asset: Asset, assetsTotal: number): string {
    const colorSet = getColorForRank(asset.rank, assetsTotal);
    const profileWallet = padRight(`${asset.profile}`, 20);
    const tokenNamePadded = padRight(asset.tokenName || asset.assetName, 20);
    const rankPadded = padRight(`Rank: ${asset.rank === -1 ? 'n/a' : asset.rank}`, 13);
    asset.rankClassification = colorSet.label;
    return colorSet.color(`${profileWallet}${tokenNamePadded}${rankPadded}`);
}

export function assetDetailsGeneric(tokenId: string, assetDetailsMap: Map<string, Asset>) {
    const asset = assetDetailsMap.get(tokenId);
    if (asset.tokenAttributes.length > 1) {
        asset.tokenAttributes = asset.tokenAttributes.filter(ta => ta.key !== 'STATUS' && ta.value !== 'UNREVEALED');
    }
    return (
        `${padRight('Rarity', 12)}: ${padRight(asset.rankClassification, 12)}\n` +
        `${'-'.repeat(32)}\n` +
        asset.tokenAttributes
            .map(attr => {
                const percentage = percentages[attr.key][attr.value];
                const value = `${attr.value} (${percentage}%)`;
                return `${padRight(attr.key, 12)}: ${padRight(value, 12)}`;
            })
            .join('\n')
    );
}

export async function initializeGenericScores(assetConfig: AssetConfig): Promise<void> {
    if (!scores) {
        scores = await getCollectionRanking(assetConfig);
        percentages = calculatePercentages(scores);
    }
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
