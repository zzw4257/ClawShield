import { expect } from "chai";
import { ethers } from "hardhat";

describe("ClawShieldRegistry", function () {
  async function deployFixture() {
    const [owner, attester, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("ClawShieldRegistry");
    const contract = await Factory.deploy(owner.address);
    await contract.waitForDeployment();
    return { contract, owner, attester, other };
  }

  it("allows owner to set attester", async function () {
    const { contract, attester } = await deployFixture();
    await contract.setAttester(attester.address, true);
    expect(await contract.isAttester(attester.address)).to.equal(true);
  });

  it("initializes owner as attester with green attestation policy", async function () {
    const { contract, owner } = await deployFixture();
    expect(await contract.isAttester(owner.address)).to.equal(true);
    expect(await contract.maxAttestableScore()).to.equal(29);
  });

  it("rejects attest from non-attester", async function () {
    const { contract, other } = await deployFixture();
    await expect(
      contract.connect(other).attest(
        ethers.keccak256(ethers.toUtf8Bytes("fingerprint")),
        10,
        "https://example.com/report.json",
        ethers.keccak256(ethers.toUtf8Bytes("report")),
        "https://github.com/acme/repo",
        "abc123"
      )
    ).to.be.revertedWithCustomError(contract, "NotAttester");
  });

  it("stores and returns latest attestation", async function () {
    const { contract, owner, attester } = await deployFixture();
    await contract.connect(owner).setAttester(attester.address, true);

    const fingerprint = ethers.keccak256(ethers.toUtf8Bytes("fp-1"));
    const reportHash = ethers.keccak256(ethers.toUtf8Bytes("report-1"));

    await expect(
      contract.connect(attester).attest(
        fingerprint,
        22,
        "https://example.com/reports/1",
        reportHash,
        "https://github.com/acme/repo",
        "d34db33f"
      )
    ).to.emit(contract, "Attested");

    const latest = await contract.getLatest(fingerprint);
    expect(latest.fingerprint).to.equal(fingerprint);
    expect(latest.score).to.equal(22);
    expect(latest.attester).to.equal(attester.address);
    expect(latest.revoked).to.equal(false);
  });

  it("supports revoke by latest attester", async function () {
    const { contract, owner, attester } = await deployFixture();
    await contract.connect(owner).setAttester(attester.address, true);

    const fingerprint = ethers.keccak256(ethers.toUtf8Bytes("fp-2"));

    await contract.connect(attester).attest(
      fingerprint,
      12,
      "https://example.com/reports/2",
      ethers.keccak256(ethers.toUtf8Bytes("report-2")),
      "https://github.com/acme/repo",
      "bead111"
    );

    await expect(contract.connect(attester).revoke(fingerprint, "https://example.com/revoke-reason"))
      .to.emit(contract, "Revoked");

    const latest = await contract.getLatest(fingerprint);
    expect(latest.revoked).to.equal(true);
    expect(latest.reasonURI).to.equal("https://example.com/revoke-reason");
  });

  it("rejects score > 100", async function () {
    const { contract, owner, attester } = await deployFixture();
    await contract.connect(owner).setAttester(attester.address, true);

    await expect(
      contract.connect(attester).attest(
        ethers.keccak256(ethers.toUtf8Bytes("fp-3")),
        101,
        "https://example.com/reports/3",
        ethers.keccak256(ethers.toUtf8Bytes("report-3")),
        "https://github.com/acme/repo",
        "face222"
      )
    ).to.be.revertedWithCustomError(contract, "InvalidScore");
  });

  it("rejects score above max attestation policy", async function () {
    const { contract, owner, attester } = await deployFixture();
    await contract.connect(owner).setAttester(attester.address, true);

    await expect(
      contract.connect(attester).attest(
        ethers.keccak256(ethers.toUtf8Bytes("fp-4")),
        55,
        "https://example.com/reports/4",
        ethers.keccak256(ethers.toUtf8Bytes("report-4")),
        "https://github.com/acme/repo",
        "face333"
      )
    ).to.be.revertedWithCustomError(contract, "ScoreExceedsAttestationPolicy");
  });

  it("allows owner to update max attestable score", async function () {
    const { contract, owner, attester } = await deployFixture();
    await contract.connect(owner).setAttester(attester.address, true);
    await contract.connect(owner).setMaxAttestableScore(60);

    await expect(
      contract.connect(attester).attest(
        ethers.keccak256(ethers.toUtf8Bytes("fp-5")),
        55,
        "https://example.com/reports/5",
        ethers.keccak256(ethers.toUtf8Bytes("report-5")),
        "https://github.com/acme/repo",
        "face444"
      )
    ).to.emit(contract, "Attested");
  });
});
