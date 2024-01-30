export interface Asset {
    listingId: string;
    tokenName: string;
    listingItemPrice: string;
    listingStartAt: string;
    tokenId: string;
    chillClaimed: boolean;
    tokenAttributes: {
        key: string;
        type: 'STRING' | 'NUMBER';
        value: string;
    }[];
}

export interface StaticStats {
    whalesScores: Record<number, number>;
}

export type GatherMode = 'price-low-high' | 'recently-listed';
