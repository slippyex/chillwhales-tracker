import { Web3 } from 'web3';
import config from '../config';
import { readFileContent } from '../utils';

const contractABI = readFileContent('resources', 'ChillContractABI.json');
const web3 = new Web3(config.chainEndpoint);
const contract = new web3.eth.Contract(JSON.parse(contractABI), config.contractAddress);

export async function getClaimedStatusFor(tokenId: string): Promise<boolean> {
    try {
        return (await contract.methods.getClaimedStatusFor(tokenId).call()) as boolean;
    } catch (error) {
        console.error('Error:', error);
    }
}
