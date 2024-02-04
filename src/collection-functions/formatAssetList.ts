import { Asset, AssetFormatListFunctionContainer } from 'index';
import dayjs from 'dayjs';
import { padRight } from '../utils';
import { formatChillWhalesListEntry } from '../collection-specific-impl/chillWhales';

export const formatAssetListFunctions: AssetFormatListFunctionContainer = {
    chillWhales(asset: Asset): string {
        return formatChillWhalesListEntry(asset);
    },
    generic(asset: Asset): string {
        const price = parseFloat(asset.listingItemPrice) / 1e18;
        const timestamp = dayjs(asset.listingStartAt).format('YYYY-MM-DD HH:mm:ss');
        const tokenNamePadded = padRight(asset.tokenName, 20);
        const pricePadded = `LYX: ${price.toFixed(2)}`;
        return `${timestamp}\t${tokenNamePadded}${pricePadded}`;
    }
};
