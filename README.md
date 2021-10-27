![screenshot](https://user-images.githubusercontent.com/42667460/132098481-fd8e8bb3-7b96-4d42-b6c0-e672c3ec9bef.PNG)
# Crypto-notifier

Notify the user when a cryptocurrency price goes 🚀 by the defined amount using [Cryptocompare.com](https://www.cryptocompare.com/ "Cryptocompare website") API.

## Built with

* [React](https://github.com/facebook/react)

* [Cryptocompare API](https://cryptocompare.com/)

## How It Works

1. Every 20 seconds, we fetch the current cryptocurrency prices up to 9 times and store them.
2. Then, we compare the first and last price of the fetched cryptocurrency.
3. We keep comparing them every 20 seconds until the cryptocurrency price rises by the defined amount.
4. Then, we notify the user with a notification sound (if turned on).

## Installation

1. Clone the repo
  ```shell
  git clone https://github.com/Arsh1a/crypto-notifier.git
  ```

2. Install NPM packages
```shell
npm install
```

3. Start the app
```shell
npm start
```

## Contributing

1. Fork the Project
2. Create your Feature Branch (git checkout -b feature/AmazingFeature)
3. Commit your Changes (git commit -m 'Add some AmazingFeature')
4. Push to the Branch (git push origin feature/AmazingFeature)
5. Open a Pull Request
