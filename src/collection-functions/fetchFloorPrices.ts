import { fetchChillWhalesFloor } from '../collection-specific-impl/chillWhales';
import { AssetFetchFloorsFunctionContainer } from 'index';
import { fetchFloorPricePer } from '../requests/universalpage';
import dayjs from 'dayjs';
import chalk from 'chalk';

export const assetFloorFunctions: AssetFetchFloorsFunctionContainer = {
    async chillWhales(assetConfig): Promise<string> {
        return fetchChillWhalesFloor(assetConfig.assetContract);
    },
    async generic(assetConfig): Promise<string> {
        try {
            const price = await fetchFloorPricePer(assetConfig.assetContract);
            return `Floor Prices (last sync: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}) >> ${chalk.yellowBright(price)} LYX`;
        } catch (error) {
            return `Error fetching floor price: ${error.message}`;
        }
    }
};
