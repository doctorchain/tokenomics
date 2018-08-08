# Tokenomics

<div>

[![Build Status](https://travis-ci.com/doctorchain/tokenomics.svg?branch=master)](https://travis-ci.com/doctorchain/tokenomics.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/doctorchain/tokenomics/badge.svg?branch=master)](https://coveralls.io/github/doctorchain/tokenomics?branch=master)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://travis-ci.com/doctorchain/tokenomics/pulls)

</div>

This box comes with everything you need to start a truffle project with Travis-ci and Coveralls integration. It also includes solium, eslint, and several common testing helpers.

## Installation

1. Install Truffle and Ganache CLI globally.
    ```shell
    npm install -g truffle
    npm install -g ganache-cli
    ```
2. Create a `.env` file in the root directory and add your private key.
    ```
    RINKEBY_PRIVATE_KEY="MyPrivateKeyHere..."
    ROPSTEN_PRIVATE_KEY="MyPrivateKeyHere..."
    ```