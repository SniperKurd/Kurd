import os
from mnemonic import Mnemonic
from eth_account import Account
from web3 import Web3

# Required to use mnemonic-derived accounts with eth-account
Account.enable_unaudited_hdwallet_features()


class SimpleWallet:
    def __init__(self, provider_url: str):
        self.mnemo = Mnemonic('english')
        self.provider_url = provider_url
        self.w3 = Web3(Web3.HTTPProvider(provider_url))
        if not self.w3.is_connected():
            raise RuntimeError('Could not connect to provider')

    def create_wallet(self):
        """Generate a new wallet returning the mnemonic and account."""
        phrase = self.mnemo.generate(128)
        acct = Account.from_mnemonic(phrase)
        return phrase, acct

    def load_wallet(self, phrase: str):
        acct = Account.from_mnemonic(phrase)
        return acct

    def get_balance(self, address: str):
        wei_balance = self.w3.eth.get_balance(address)
        return self.w3.from_wei(wei_balance, 'ether')

    def send_eth(self, acct, to_address: str, value_eth: float, gas: int = 21000, gas_price_gwei: int = 20):
        nonce = self.w3.eth.get_transaction_count(acct.address)
        tx = {
            'nonce': nonce,
            'to': to_address,
            'value': self.w3.to_wei(value_eth, 'ether'),
            'gas': gas,
            'gasPrice': self.w3.to_wei(gas_price_gwei, 'gwei')
        }
        signed_tx = acct.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        return tx_hash.hex()


def main():
    provider = os.environ.get('PROVIDER_URL', 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID')
    wallet = SimpleWallet(provider)
    phrase, acct = wallet.create_wallet()
    print('Mnemonic:', phrase)
    print('Address:', acct.address)
    balance = wallet.get_balance(acct.address)
    print('Balance:', balance, 'ETH')


if __name__ == '__main__':
    main()
