import React, { useState, useCallback } from "react";
import { Jumbotron, Container } from "react-bootstrap";

// Web3
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

// Components
import Home from "./components/Home";
import Header from "./components/Header";

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: "6a622f155ca346e1b3521e8160c71b65", // required
    },
  },
};
const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions, // required
  theme: "dark",
});

function App() {
  const [account, setAccount] = useState();

  const logout = () => {
    setAccount(null);
    web3Modal.clearCachedProvider();
  };

  const connectWeb3 = useCallback(async () => {
    try {
      const provider = await web3Modal.connect();

      window.web3 = new Web3(provider);

      const acc = await window.web3.eth.getAccounts();
      setAccount(acc[0]);

      console.log("Connected Account: ", acc[0]);
    } catch (error) {
      console.log(error.message);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Header account={account} connectWeb3={connectWeb3} logout={logout} />
      {!account && (
        <Jumbotron>
          <Container className="m-5">
            <h1>Welcome!</h1>
            <p>
              Did you know that everytime you interact with DApps using your
              ERC-20 tokens, you need to make an approval? Most of these
              approvals are INFINITE. This means that you are approving the
              smart contract to spend 100% of your wallet token balance! This
              tools allows you to check what infinite approvals have you made
              before, and clear this approval by executing a transaction to the
              token contract.
            </p>
            <p>
              <h4 className="mt-4">
                Let's start by connecting to a web3 provider!
              </h4>
            </p>
          </Container>
        </Jumbotron>
      )}

      {account && <Home account={account} />}
    </div>
  );
}

export default App;
