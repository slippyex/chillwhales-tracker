import { Asset, AssetFetchAssetsFunctionContainer, RarityLookup } from 'index';
import { fetchAssets } from '../requests/universalpage';
import { fetchChillWhalesAssets } from '../collection-specific-impl/chillWhales';
import { getCollectionRanking } from '../helpers/computeRarity';

export let scores: RarityLookup;

export const assetFetchFunctions: AssetFetchAssetsFunctionContainer = {
    async chillWhales(assetConfig, assetDetailsMap, gatherMode): Promise<Asset[]> {
        return await fetchChillWhalesAssets(assetConfig.assetContract, assetDetailsMap, gatherMode);
    },
    async generic(assetConfig, assetDetailsMap, gatherMode) {
        if (!scores) {
            scores = await getCollectionRanking(assetConfig);
        }
        const assets = await fetchAssets(assetConfig.assetContract, gatherMode);
        for (const asset of assets) {
            asset.rank = scores.rarity[asset.tokenId].rank;
            asset.score = scores.rarity[asset.tokenId].score;
            assetDetailsMap.set(asset.tokenName.split('#')[1], asset);
        }
        return assets;
    }
};
