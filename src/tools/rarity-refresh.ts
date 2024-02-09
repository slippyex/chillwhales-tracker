import { deleteFile, readFileContent } from '../utils';
import { AssetConfig } from '../@types';
import { getCollectionRanking } from '../helpers/computeRarity';

const args = process.argv.slice(2);

(async () => {
    const assetConfig = JSON.parse(
        readFileContent('configs', `${args.length === 0 ? 'chillwhales' : args[0]}.config.json`, true)
    ) as AssetConfig;
    if (!assetConfig.assetContract) {
        throw new Error(
            `provided config for collection ${args} is incomplete - no contract address found in the config`
        );
    }
    deleteFile('cache', `${assetConfig.collection}Scores.json`);

    console.log(`re-calculating rarity lookups for ${assetConfig.collection}`);
    const result = await getCollectionRanking(assetConfig);
    console.log(result.traitFrequencies);
    console.log(`rankings for ${result.assetsTotal} computed`);
})();
