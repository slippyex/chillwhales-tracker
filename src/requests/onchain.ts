import { Web3 } from 'web3';
import config from '../config';
import { readFileContent } from '../utils';

const chillContractABI = readFileContent('resources', 'ChillContractABI.json');
const burntWhalesContractABI = readFileContent('resources', 'BurntWhalesContractABI.json');
const web3 = new Web3(config.chainEndpoint);
const chillContract = new web3.eth.Contract(JSON.parse(chillContractABI), config.chillContractAddress);
const burntWhalesContract = new web3.eth.Contract(
    JSON.parse(burntWhalesContractABI),
    config.burntWhalesContractAddress
);

export async function isChillClaimed(tokenId: string): Promise<boolean> {
    try {
        return (await chillContract.methods.getClaimedStatusFor(tokenId).call()) as boolean;
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function isBurntWhaleClaimed(tokenId: string): Promise<boolean> {
    try {
        return (await burntWhalesContract.methods.getClaimedChillwhales(tokenId).call()) as boolean;
    } catch (error) {
        console.error('Error:', error);
    }
}
