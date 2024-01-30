import config from '../config';
import axios from 'axios';
import { Asset, GatherMode } from 'index';

export async function fetchFloorPricePer(skin: string): Promise<number> {
    try {
        const floorPriceUrl = config.universalPageCollectionBase + `?page=0&perPage=1&sortBy=price-low-high`;
        const query = `&attributes=%5B%7B%22key%22%3A%22Skin%22%2C%22value%22%3A%5B%22${encodeURIComponent(skin)}%22%5D%7D%5D`;
        const response = await axios.get(floorPriceUrl + (skin ? query : ''), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0'
            }
        });
        const asset: Asset = response.data[0];
        return parseFloat(asset.listingItemPrice) / 1e18;
    } catch (err) {
        return -1;
    }
}

export async function fetchAssets(gatherMode: GatherMode): Promise<Asset[]> {
    const url = config.universalPageCollectionBase + `?page=0&perPage=${config.amountToFetch}&sortBy=${gatherMode}`;
    const response = await axios.get<Asset[]>(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0'
        }
    });
    return response.data;
}
