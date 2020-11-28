import React, { useState, useEffect, useCallback } from "react";
import { Table, Container, Badge, ProgressBar } from "react-bootstrap";
import _ from "lodash";

import Allowance from "./Allowance";

import { KNOWN_ADDRESSES } from "../constants";

const { flow, partialRight: pr, keyBy, values } = _;
const lastUniqBy = (iteratee) => flow(pr(keyBy, iteratee), values);

export default function Home({ account }) {
  const [approvals, setApprovals] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [approvedAddress, setApprovedAddress] = useState();
  const [tokenAddress, setTokenAddress] = useState();

  const checkAddress = (address) => {
    const known = KNOWN_ADDRESSES.filter(
      (token) => token.address.toLowerCase() === address.toLowerCase()
    );

    return known.length > 0 ? known[0] : null;
  };

  const checkAllowance = (_tokenAddress, _approvedAddress) => {
    setTokenAddress(_tokenAddress);
    setApprovedAddress(_approvedAddress);
    setShowDetails(true);
  };

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
        if (tx.input && tx.input.includes("0x095ea7b3")) {
          const infiniteApproval = tx.input.includes(
            "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
          );

          const approvedAddress = "0x" + tx.input.slice(34, 74);

          const decodedAddress = checkAddress(approvedAddress);

          _approvals.push({
            infiniteApproval,
            tokenAddress: tx.to,
            approvedAddress,
            decodedAddress,
          });
        }
      }
      const uniques = lastUniqBy("tokenAddress")(_approvals);

      setApprovals(uniques);
      setFetching(false);
    } catch (error) {
      console.log(error.message);
    }
  }, [account]);

  useEffect(() => {
    fetchApprovals();
  }, [account, fetchApprovals]);

  return (
    <>
      {showDetails && (
        <Allowance
          tokenAddress={tokenAddress}
          approvedAddress={approvedAddress}
          account={account}
          goBack={() => setShowDetails(false)}
        />
      )}
      {!showDetails && (
        <Container className="mt-5">
          {fetching && (
            <Container>
              {" "}
              <h2>Fetching data ... {`${progress}%`}</h2>
              <ProgressBar now={progress} />
            </Container>
          )}
          {!fetching && (
            <>
              <h4 className="m-4">Approval Check</h4>
              <Table responsive striped bordered hover className="text-center">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Token</th>
                    <th>Approved</th>
                    <th>Infinite?</th>
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
                          {token.tokenAddress.substring(0, 8) +
                            "..." +
                            token.tokenAddress.substring(34, 42)}
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
                      <td
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          checkAllowance(
                            token.tokenAddress,
                            token.approvedAddress
                          )
                        }
                      >
                        <Badge
                          pill
                          variant={
                            token.infiniteApproval ? "danger" : "secondary"
                          }
                        >
                          {token.infiniteApproval ? "YES" : "NO"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Container>
      )}
    </>
  );
}
