import React, { useState } from "react";
import { Navbar, Nav, Button, Row } from "react-bootstrap";

export default function Header({ account, connectWeb3, logout }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      bg="dark"
      variant="dark"
      expanded={expanded}
      className="justify-content-between"
    >
      <Navbar.Brand href="#home">Waffle Tools</Navbar.Brand>
      <div className="align-self-baseline">
        <Nav>
          {account ? (
            <Row className="mr-2">
              <Nav.Link
                className="align-self-center mr-2"
                onClick={() => setExpanded(false)}
                target="_blank"
                rel="noopener noreferrer"
                href={`https://etherscan.io/address/${account}`}
              >
                Connected to:{" "}
                {account.substring(0, 4) + "..." + account.substring(38, 42)}
              </Nav.Link>
              <Nav.Link>
                <Button variant="light" onClick={logout}>
                  Logout
                </Button>
              </Nav.Link>
            </Row>
          ) : (
            window.web3 && (
              <Row className="mr-2">
                <Nav.Link>
                  <Button
                    className="mr-2"
                    variant="light"
                    onClick={connectWeb3}
                  >
                    Connect to Web3
                  </Button>
                </Nav.Link>
              </Row>
            )
          )}
        </Nav>
      </div>
    </Navbar>
  );
}
