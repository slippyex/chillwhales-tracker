import { padRight } from '../utils';
import { Asset, AssetDetailsFunctionContainer } from 'index';
import { chillWhaleDetails } from '../collection-specific-impl/chillWhales';

export const assetDetailsFunctions: AssetDetailsFunctionContainer = {
    chillWhales(assetId: string, assetDetailsMap: Map<string, Asset>): string {
        return chillWhaleDetails(assetId, assetDetailsMap);
    },
    generic(assetId: string, assetDetailsMap): string {
        const asset = assetDetailsMap.get(assetId);
        return asset.tokenAttributes
            .map(attr => {
                const value = `${attr.value}`;
                return `${padRight(attr.key, 12)}: ${padRight(value, 12)}`;
            })
            .join('\n');
    }
};
