import { Asset, AssetFetchAssetsFunctionContainer } from 'index';
import { fetchAssets } from '../requests/universalpage';
import { fetchChillWhalesAssets } from '../collection-specific-impl/chillWhales';

export const assetFetchFunctions: AssetFetchAssetsFunctionContainer = {
    async chillWhales(assetConfig, assetDetailsMap, gatherMode): Promise<Asset[]> {
        return await fetchChillWhalesAssets(assetConfig.assetContract, assetDetailsMap, gatherMode);
    },
    async generic(assetConfig, assetDetailsMap, gatherMode) {
        const assets = await fetchAssets(assetConfig.assetContract, gatherMode);
        for (const asset of assets) {
            assetDetailsMap.set(asset.tokenName.split('#')[1], asset);
        }
        return assets;
    }
};
