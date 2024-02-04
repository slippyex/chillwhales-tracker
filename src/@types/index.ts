export interface Asset {
    listingId: string;
    tokenName: string;
    listingItemPrice: string;
    listingStartAt: string;
    tokenId: string;
    chillClaimed: boolean;
    burntWhaleClaimed: boolean;
    tokenAttributes: {
        key: string;
        type: 'STRING' | 'NUMBER';
        value: string;
    }[];
}

export interface StaticStats {
    whalesScores: Record<number, number>;
    traitsRarity: Record<string, Record<string, number>>;
}

export type GatherMode = 'price-low-high' | 'recently-listed';

export interface AssetConfig {
    collection: string;
    assetContract: string;
    functionsNamespace: string;
}

export interface AssetFetchAssetsFunctionContainer {
    [key: string]: (
        assetConfig: AssetConfig,
        assetDetailsMap: Map<string, Asset>,
        gatherMode: GatherMode
    ) => Promise<Asset[]>;
}

export interface AssetFetchFloorsFunctionContainer {
    [key: string]: (assetConfig: AssetConfig) => Promise<string>;
}

export interface AssetDetailsFunctionContainer {
    [key: string]: (assetId: string, assetDetailsMap: Map<string, Asset>) => string;
}

export interface AssetFormatListFunctionContainer {
    [key: string]: (asset: Asset) => string;
}
