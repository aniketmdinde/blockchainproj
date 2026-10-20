
import { Web3 } from "web3";

const ABI = [
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [{ "type": "address", "name": "" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "issueCertificate",
    "inputs": [
      { "type": "bytes32", "name": "certificateIdHash" },
      { "type": "bytes32", "name": "dataHash" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "revokeCertificate",
    "inputs": [
      { "type": "bytes32", "name": "certificateIdHash" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getCertificate",
    "inputs": [
      { "type": "bytes32", "name": "certificateIdHash" }
    ],
    "outputs": [
      { "type": "bytes32", "name": "dataHash" },
      { "type": "address", "name": "issuer" },
      { "type": "uint256", "name": "issuedAt" },
      { "type": "bool", "name": "revoked" },
      { "type": "bool", "name": "exists" }
    ],
    "stateMutability": "view"
  }
];

const LOCAL_RPC = "http://127.0.0.1:8545";
const EXPECTED_CHAIN_ID = "0x7a69";

let readContract;
let writeContract;
let account;
let institutionOwner;

const $ = (id) => document.getElementById(id);

function showResult(id, message, type = "info") {
  const element = $(id);
  element.classList.remove("hidden");
  element.textContent = message;
  element.dataset.type = type;
}

function errorMessage(error) {
  return error?.shortMessage ||
    error?.reason ||
    error?.message ||
    "Something went wrong.";
}

// Use exactly the same canonical representation for issuing
// and verifying certificates.
function getFingerprint(id, student, course, date) {
  const canonicalData = JSON.stringify([
    id.trim(),
    student.trim(),
    course.trim(),
    date
  ]);

  return Web3.utils.keccak256(canonicalData);
}

function getIdHash(id) {
  return Web3.utils.keccak256(id.trim());
}

function getFormData(prefix) {
  return {
    id: $(`${prefix}Id`).value.trim(),
    student: $(`${prefix}Student`).value.trim(),
    course: $(`${prefix}Course`).value.trim(),
    date: $(`${prefix}Date`).value
  };
}

function isComplete(data) {
  return Boolean(data.id && data.student && data.course && data.date);
}

async function initialize() {
  try {
    const response = await fetch("./contract-address.json");

    if (!response.ok) {
      throw new Error("Contract address file not found. Deploy the contract first.");
    }

    const { address } = await response.json();

    // Public reads use the local blockchain RPC directly.
    const readWeb3 = new Web3(LOCAL_RPC);
    readContract = new readWeb3.eth.Contract(ABI, address);

    institutionOwner = await readContract.methods.owner().call();

    $("walletStatus").textContent =
      `Institution owner: ${institutionOwner}`;
  } catch (error) {
    $("walletStatus").textContent =
      `Blockchain unavailable: ${errorMessage(error)}`;
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    showResult(
      "issueResult",
      "Install MetaMask to issue or revoke certificates."
    );
    return;
  }

  try {
    const chainId = await window.ethereum.request({
      method: "eth_chainId"
    });

    if (chainId !== EXPECTED_CHAIN_ID) {
      showResult(
        "issueResult",
        "Switch MetaMask to Hardhat Local (chain ID 31337)."
      );
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    account = accounts[0];

    const walletWeb3 = new Web3(window.ethereum);
    writeContract = new walletWeb3.eth.Contract(
      ABI,
      readContract.options.address
    );

    $("connectWallet").textContent =
      `${account.slice(0, 6)}...${account.slice(-4)}`;

    $("walletStatus").textContent =
      `Connected wallet: ${account}`;
  } catch (error) {
    showResult("issueResult", errorMessage(error), "error");
  }
}

async function issueCertificate(event) {
  event.preventDefault();

  if (!writeContract || !account) {
    showResult("issueResult", "Connect the institution wallet first.");
    return;
  }

  try {
    const owner = await readContract.methods.owner().call();

    if (owner.toLowerCase() !== account.toLowerCase()) {
      throw new Error(
        "This wallet is not the institution owner."
      );
    }

    const data = getFormData("issue");

    if (!isComplete(data)) {
      throw new Error("Complete all certificate fields.");
    }

    const idHash = getIdHash(data.id);
    const dataHash = getFingerprint(
      data.id, data.student, data.course, data.date
    );

    showResult(
      "issueResult",
      "Confirm the issuance transaction in MetaMask..."
    );

    await writeContract.methods
      .issueCertificate(idHash, dataHash)
      .send({ from: account });

    showResult(
      "issueResult",
      `Certificate issued successfully. Fingerprint: ${dataHash}`,
      "success"
    );

    $("issueForm").reset();
  } catch (error) {
    showResult("issueResult", errorMessage(error), "error");
  }
}

async function verifyCertificate(event) {
  event.preventDefault();

  try {
    if (!readContract) {
      throw new Error("Blockchain unavailable. Start the local node.");
    }

    const data = getFormData("verify");

    if (!isComplete(data)) {
      throw new Error("Complete all certificate fields.");
    }

    const record = await readContract.methods
      .getCertificate(getIdHash(data.id))
      .call();

    if (!record[4]) {
      showResult(
        "verifyResult",
        "NOT FOUND — No certificate is registered with this ID.",
        "error"
      );
      return;
    }

    if (record[3]) {
      showResult(
        "verifyResult",
        "REVOKED — This certificate was revoked by the institution.",
        "error"
      );
      return;
    }

    const submittedHash = getFingerprint(
      data.id, data.student, data.course, data.date
    );

    if (
      submittedHash.toLowerCase() !==
      record[0].toLowerCase()
    ) {
      showResult(
        "verifyResult",
        "MISMATCH — These details do not match the registered certificate.",
        "error"
      );
      return;
    }

    const issuedDate = new Date(
      Number(record[2]) * 1000
    ).toLocaleString();

    showResult(
      "verifyResult",
      `VERIFIED ✓\nCertificate details match the blockchain record.\nIssuer: ${record[1]}\nRegistered: ${issuedDate}\nFingerprint: ${record[0]}`,
      "success"
    );
  } catch (error) {
    showResult("verifyResult", errorMessage(error), "error");
  }
}

async function revokeCertificate(event) {
  event.preventDefault();

  if (!writeContract || !account) {
    showResult("revokeResult", "Connect the institution wallet first.");
    return;
  }

  try {
    const owner = await readContract.methods.owner().call();

    if (owner.toLowerCase() !== account.toLowerCase()) {
      throw new Error("Only the institution owner can revoke certificates.");
    }

    const id = $("revokeId").value.trim();

    if (!id) {
      throw new Error("Enter a certificate ID.");
    }

    showResult(
      "revokeResult",
      "Confirm the revocation transaction in MetaMask..."
    );

    await writeContract.methods
      .revokeCertificate(getIdHash(id))
      .send({ from: account });

    showResult(
      "revokeResult",
      "Certificate revoked successfully.",
      "success"
    );

    $("revokeForm").reset();
  } catch (error) {
    showResult("revokeResult", errorMessage(error), "error");
  }
}

$("connectWallet").addEventListener("click", connectWallet);
$("issueForm").addEventListener("submit", issueCertificate);
$("verifyForm").addEventListener("submit", verifyCertificate);
$("revokeForm").addEventListener("submit", revokeCertificate);

if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => {
    window.location.reload();
  });

  window.ethereum.on("chainChanged", () => {
    window.location.reload();
  });
}

initialize();