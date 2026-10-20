// SPDX-License-Identifier: MIT
 pragma solidity ^0.8.24;

 contract CertificateRegistry {
     address public owner;

     struct Certificate {
         bytes32 dataHash;
         address issuer;
         uint256 issuedAt;
         bool revoked;
         bool exists;
     }

     mapping(bytes32 => Certificate) private certificates;

     event CertificateIssued(
         bytes32 indexed certificateIdHash,
         bytes32 dataHash,
         address indexed issuer,
         uint256 issuedAt
     );

     event CertificateRevoked(
         bytes32 indexed certificateIdHash
     );

     modifier onlyOwner() {
         require(msg.sender == owner, "Only institution owner");
         _;
     }

     constructor() {
         owner = msg.sender;
     }

     function issueCertificate(
         bytes32 certificateIdHash,
         bytes32 dataHash
     ) external onlyOwner {
         require(
             certificateIdHash != bytes32(0),
             "Invalid certificate ID"
         );
         require(dataHash != bytes32(0), "Invalid data hash");
         require(
             !certificates[certificateIdHash].exists,
             "Certificate already exists"
         );

         certificates[certificateIdHash] = Certificate({
             dataHash: dataHash,
             issuer: msg.sender,
             issuedAt: block.timestamp,
             revoked: false,
             exists: true
         });

         emit CertificateIssued(
             certificateIdHash,
             dataHash,
             msg.sender,
             block.timestamp
         );
     }

     function revokeCertificate(
         bytes32 certificateIdHash
     ) external onlyOwner {
         require(
             certificates[certificateIdHash].exists,
             "Certificate not found"
         );
         require(
             !certificates[certificateIdHash].revoked,
             "Already revoked"
         );

         certificates[certificateIdHash].revoked = true;

         emit CertificateRevoked(certificateIdHash);
     }

     function getCertificate(
         bytes32 certificateIdHash
     )
         external
         view
         returns (
             bytes32 dataHash,
             address issuer,
             uint256 issuedAt,
             bool revoked,
             bool exists
         )
     {
         Certificate memory cert = certificates[certificateIdHash];

         return (
             cert.dataHash,
             cert.issuer,
             cert.issuedAt,
             cert.revoked,
             cert.exists
         );
     }
 }
