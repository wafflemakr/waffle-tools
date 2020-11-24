import React, { useState, useEffect, useCallback } from "react";
import { Table, Container, Button, ProgressBar } from "react-bootstrap";
import _ from "lodash";

import { ERC20_ABI, KNOWN_ADDRESSES } from "../constants";

export default function Home({ account }) {
  const [approvals, setApprovals] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [progress, setProgress] = useState(0);

  const checkAddress = (address) => {
    const known = KNOWN_ADDRESSES.filter(
      (token) => token.address.toLowerCase() === address.toLowerCase()
    );

    return known.length > 0 ? known[0] : null;
  };

  const clearAllowance = useCallback(async (contract, to) => {
    try {
      await contract.methods.approve(to, 0).send();
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  const fetchApprovals = useCallback(async () => {
    try {
      const res = await fetch(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${account}&startblock=0&endblock=99999999&sort=asc`
      );

      const data = await res.json();

      let _approvals = [];

      for (let i = 0; i < data.result.length; i++) {
        setProgress(Math.floor((100 * i) / data.result.length));
        const tx = data.result[i];
        if (tx.input.includes("0x095ea7b3")) {
          const infiniteApproval = tx.input.includes(
            "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
          );
          const token = new window.web3.eth.Contract(ERC20_ABI, tx.to, {
            from: account,
          });
          const approvedAddress = "0x" + tx.input.slice(34, 74);

          const decodedAddress = checkAddress(approvedAddress);

          let decimals = 18,
            symbol = "Unknown",
            allowance = 0;
          try {
            symbol = await token.methods.symbol().call();
            decimals = await token.methods.decimals().call();
            const _allowance = await token.methods
              .allowance(account, approvedAddress)
              .call();
            allowance = Number(_allowance / 10 ** decimals).toFixed(0);
          } catch (error) {
            console.log(error.message);
          }

          _approvals.push({
            infiniteApproval,
            symbol,
            decimals,
            tokenAddress: tx.to,
            approvedAddress,
            allowance,
            contract: token,
            decodedAddress,
          });
        }
      }

      const uniques = _.uniqBy(_approvals, (p) => p.symbol);

      console.log(uniques);
      setApprovals(uniques);
      setFetching(false);
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
  }, [account, fetchApprovals]);

  return (
    <Container className="mt-5">
      {fetching && (
        <Container>
          {" "}
          <h2>Fetching data ... {`${progress}%`}</h2>
          <ProgressBar now={progress} />
        </Container>
      )}
      {!fetching && (
        <Table responsive striped bordered hover className="text-center">
          <thead>
            <tr>
              <th>#</th>
              <th>Symbol</th>
              <th>Address</th>
              <th>Allowance</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((token, key) => (
              <tr key={key}>
                <td>{key + 1}</td>
                <td>
                  <a
                    className="text-black"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://etherscan.io/address/${token.tokenAddress}`}
                  >
                    {token.symbol}
                  </a>
                </td>
                <td>
                  <a
                    className="text-color-black"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://etherscan.io/address/${token.approvedAddress}`}
                  >
                    {token.decodedAddress
                      ? token.decodedAddress.name
                      : token.approvedAddress.substring(0, 8) +
                        "..." +
                        token.approvedAddress.substring(34, 42)}
                  </a>
                </td>
                <td>{token.infiniteApproval ? "Infinite" : token.allowance}</td>
                <td>
                  {token.infiniteApproval && (
                    <Button
                      variant="danger"
                      onClick={() =>
                        clearAllowance(token.contract, token.approvedAddress)
                      }
                    >
                      Clear
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
