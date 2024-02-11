import {
    Asset,
    AssetDetailsFunctionContainer,
    AssetFetchAssetsFunctionContainer,
    AssetFetchFloorsFunctionContainer,
    AssetFormatListFunctionContainer,
    AssetInitializeScoresContainer,
    AssetWalletFormatListFunctionContainer
} from '../@types';
import {
    chillWhaleDetails,
    fetchChillWhalesFloor,
    formatChillWhalesListWalletEntry,
    initializeWhaleScores
} from '../collection-specific-impl/chillWhales';
import {
    assetDetailsGeneric,
    fetchGenericFloorPrice,
    formatGenericWalletAsset,
    initializeGenericScores
} from '../collection-specific-impl/generic';
import { fetchChillWhalesAssets } from '../collection-specific-impl/chillWhales';
import { fetchGenericAssets } from '../collection-specific-impl/generic';
import { formatChillWhalesListEntry } from '../collection-specific-impl/chillWhales';
import { formatGenericAsset } from '../collection-specific-impl/generic';

export const assetDetailsFunctions: AssetDetailsFunctionContainer = {
    chillWhales(assetId: string, assetDetailsMap: Map<string, Asset>): string {
        return chillWhaleDetails(assetId, assetDetailsMap);
    },
    generic(tokenId: string, assetDetailsMap): string {
        return assetDetailsGeneric(tokenId, assetDetailsMap);
    }
};

export const assetFetchFunctions: AssetFetchAssetsFunctionContainer = {
    async chillWhales(assetConfig, assetDetailsMap, gatherMode): Promise<Asset[]> {
        return fetchChillWhalesAssets(assetConfig.assetContract, assetDetailsMap, gatherMode);
    },
    async generic(assetConfig, assetDetailsMap, gatherMode) {
        return fetchGenericAssets(assetConfig, assetDetailsMap, gatherMode);
    }
};

export const assetFloorFunctions: AssetFetchFloorsFunctionContainer = {
    async chillWhales(assetConfig): Promise<string> {
        return fetchChillWhalesFloor(assetConfig.assetContract);
    },
    async generic(assetConfig): Promise<string> {
        return fetchGenericFloorPrice(assetConfig);
    }
};

export const formatAssetListFunctions: AssetFormatListFunctionContainer = {
    chillWhales(asset: Asset): string {
        return formatChillWhalesListEntry(asset);
    },
    generic(asset: Asset): string {
        return formatGenericAsset(asset);
    }
};

export const formatAssetWalletListFunctions: AssetWalletFormatListFunctionContainer = {
    chillWhales(asset: Asset, assetsTotal: number): string {
        return formatChillWhalesListWalletEntry(asset, assetsTotal);
    },
    generic(asset: Asset, assetsTotal: number): string {
        return formatGenericWalletAsset(asset, assetsTotal);
    }
};

export const initializeScores: AssetInitializeScoresContainer = {
    async chillWhales(): Promise<void> {
        await initializeWhaleScores();
    },
    async generic(assetConfig) {
        await initializeGenericScores(assetConfig);
    }
};
