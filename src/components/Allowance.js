import React, { useState, useCallback, useEffect } from "react";
import { Container, Card, Button, Spinner } from "react-bootstrap";

import { ERC20_ABI, KNOWN_ADDRESSES } from "../constants";

export default function Allowance({
  tokenAddress,
  account,
  approvedAddress,
  goBack,
}) {
  const [symbol, setSymbol] = useState(null);
  const [allowance, setAllowance] = useState(0);

  const checkAddress = (address) => {
    const known = KNOWN_ADDRESSES.filter(
      (token) => token.address.toLowerCase() === address.toLowerCase()
    );

    return known.length > 0 ? known[0].name : address;
  };

  const clearAllowance = useCallback(async () => {
    try {
      const token = new window.web3.eth.Contract(ERC20_ABI, tokenAddress, {
        from: account,
      });
      await token.methods.approve(approvedAddress, 0).send();
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  const checkAllowance = useCallback(async () => {
    let _allowance = 0,
      _symbol = "Unknown",
      decimals = 18;
    try {
      const token = new window.web3.eth.Contract(ERC20_ABI, tokenAddress);
      _symbol = await token.methods.symbol().call();
      decimals = await token.methods.decimals().call();
      const allow = await token.methods
        .allowance(account, approvedAddress)
        .call();
      _allowance = Number(allow / 10 ** decimals).toFixed(0);
    } catch (error) {
      console.log(error.message);
    }
    setAllowance(_allowance);
    setSymbol(_symbol);
  });

  useEffect(() => {
    checkAllowance();
  }, []);

  return (
    <Container>
      <div className="row justify-content-center mt-5">
        {symbol ? (
          <Card className="w-50">
            <Card.Body>
              <Card.Title
                style={{ fontSize: "30px", textDecoration: "underline" }}
              >
                {symbol} Allowance
              </Card.Title>
              <Card.Text className="mt-4" style={{ fontSize: "20px" }}>
                Token Address:{" "}
                <a
                  className="text-black"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://etherscan.io/address/${tokenAddress}`}
                >
                  {tokenAddress}
                </a>
              </Card.Text>
              <Card.Text className="mt-4" style={{ fontSize: "20px" }}>
                Approved To:{" "}
                <a
                  className="text-color-black"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://etherscan.io/address/${approvedAddress}`}
                >
                  {" "}
                  {checkAddress(approvedAddress)}
                </a>
              </Card.Text>
              <Card.Text className="mt-4" style={{ fontSize: "20px" }}>
                Current Allowance: {allowance} {symbol}
              </Card.Text>
            </Card.Body>
            <Card.Footer className="mt-4">
              <div className="row justify-content-around mt-2">
                <Button variant="danger" onClick={clearAllowance}>
                  Clear
                </Button>
                <Button variant="secondary" onClick={goBack}>
                  Back
                </Button>
              </div>
            </Card.Footer>
          </Card>
        ) : (
          <Spinner animation="grow" />
        )}
      </div>
    </Container>
  );
}
